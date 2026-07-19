import type { Session } from 'neo4j-driver';

// Get subgraph of the universe from an AstroJSON format neo4j database
export const getUniverseSubgraph = async (
	neo4jSession: Session,
	currentSystemId: string
): Promise<{
	system: AstroJSON.Neo4J.Node.System;
	planets: AstroJSON.Neo4J.Node.Planet[];
	orbits: AstroJSON.Neo4J.Edge.Orbit[];
	visibleSystems: AstroJSON.Neo4J.Node.System[];
}> => {
	// Helper to parse results from neo4j
	const queryNeo4j = async (query: string): Promise<Record<string, any>[]> =>
		neo4jSession.run(query).then((result) => result.records.map((record) => record.toObject()));

	// Get local bodies to be shown in greatest detail
	const localBodies = await queryNeo4j(`
        MATCH (system:System { id: $currentSystemId })
        OPTIONAL MATCH (star:Star)-[:IN]->(system)
        OPTIONAL MATCH (planet:Planet)-[orbit:ORBITS]->(star)
        RETURN
            system,
            collect(DISTINCT star) AS stars,
            collect(DISTINCT planet) AS planets,
            collect(DISTINCT orbit) AS orbits
    `);
	console.log(`Local bodies for system ${currentSystemId}:`, localBodies);

	// Get distant bodies system children
	const visibleSytems = await queryNeo4j(`
        MATCH (:System { id: 'Solar System' })-[:IN]->(neighbourhood:Neighbourhood)
        MATCH (visibleSystem:System)-[:IN]->(neighbourhood)
        RETURN collect(visibleSystem) AS visibleSystems
    `);
	console.log(`Visible systems in neighbourhood:`, visibleSytems);

	// Convert from Neo4j records to AstroJSON format

	return {
		system: localBodies[0]?.system.properties,
		planets: localBodies[0]?.planets.map((node: any) => node.properties),
		orbits: localBodies[0]?.orbits.map((edge: any) => edge.properties),
		visibleSystems: visibleSytems[0]?.visibleSystems.map((node: any) => node.properties)
	};
};
