import { json } from '@sveltejs/kit';

// Returns subgraph of systems visible from a given system
export const POST = async ({ locals, request }) => {
	console.log('POST request received for /api/neo4j');
	const { systemName } = await request.json();

	// Helper to parse results from neo4j
	const queryNeo4j = async (query: string) =>
		locals.db.run(query).then((result) => result.records.map((record) => record.toObject()));

	// Get local bodies to be shown in greatest detail
	const localBodies = await queryNeo4j(`
        MATCH (system:System { id: '${systemName}' })
        OPTIONAL MATCH (star:Star)-[:IN]->(system)
        OPTIONAL MATCH (planet:Planet)-[orbit:ORBITS]->(star)
        RETURN
            system,
            collect(DISTINCT star) AS stars,
            collect(DISTINCT planet) AS planets,
            collect(DISTINCT orbit) AS orbits
    `);
	console.log(`Local bodies for system ${systemName}:`, localBodies.length);

	// Get distant bodies system children
	const remoteSystems = await queryNeo4j(`
        MATCH (:System { id: '${systemName}' })-[:IN]->(neighbourhood:Neighbourhood)
        MATCH (neighbourhood)-[sees:SEES]->(visibleSystem:System)
        RETURN 
			collect(DISTINCT visibleSystem) AS visibleSystems,
			collect(DISTINCT sees) AS sees
    `);
	console.log(`Visible systems in neighbourhood:`, remoteSystems[0].visibleSystems.length);

	// Get systems and stars from neo4j payload
	const system: AstroJSON.Schema.System = localBodies[0]?.system.properties;
	const stars: AstroJSON.Renderer.Star[] = localBodies[0]?.stars.map((node) => node.properties);

	// Join planets with their orbits from neo4j payload
	const planets: AstroJSON.Renderer.Planet[] = localBodies[0]?.planets.map((node) => ({
		...node.properties,
		orbit: localBodies[0]?.orbits.find((edge) => edge.start.equals(node.identity))?.properties
	}));

	// Join visible systems with their sees edges from neo4j payload
	const visibleSystems: AstroJSON.Renderer.VisibleSystemInSky[] =
		remoteSystems[0]?.visibleSystems.map((node) => ({
			...node.properties,
			viewpoint: remoteSystems[0]?.sees.find((edge) => edge.end?.equals(node.identity))
				?.properties ?? {
				distance: 0,
				direction: [0, 0, 1],
				apparentBrightness: 99
			}
		}));

	console.log('Got AstroJSON system render record', {
		system: system.name,
		planets: planets.length,
		stars: stars.length,
		visibleSystems: visibleSystems.length
	});
	return json({
		system,
		planets,
		stars,
		visibleSystems
	});
};
