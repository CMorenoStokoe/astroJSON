import { json } from '@sveltejs/kit';

// Returns subgraph of systems visible from a given system
export const POST = async ({ locals, request }) => {
	const { systemName } = await request.json();

	// Helper to parse results from neo4j
	const queryNeo4j = async (query: string): Promise<Record<string, any>[]> =>
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
	console.log(`Local bodies for system ${systemName}:`, localBodies);

	// Get distant bodies system children
	const visibleSytems = await queryNeo4j(`
        MATCH (:System { id: '${systemName}' })-[:IN]->(neighbourhood:Neighbourhood)
        MATCH (visibleSystem:System)-[:IN]->(neighbourhood)
        RETURN collect(visibleSystem) AS visibleSystems
    `);
	console.log(`Visible systems in neighbourhood:`, visibleSytems);

	// Convert from Neo4j records to AstroJSON format
	const data = {
		system: localBodies[0]?.system.properties,
		planets: localBodies[0]?.planets.map((node: any) => node.properties),
		orbits: localBodies[0]?.orbits.map((edge: any) => edge.properties),
		visibleSystems: visibleSytems[0]?.visibleSystems.map((node: any) => node.properties)
	};

	return json({ data });
};
