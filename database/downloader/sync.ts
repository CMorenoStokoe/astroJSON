import neo4j from 'neo4j-driver'
import path from 'node:path'
import dotenv from 'dotenv'
import galaxies from '$data/preprocess/galaxies.json'
import galaxyMembership from '$data/preprocess/galaxy-membership.json'
import neighbourhoodMembership from '$data/preprocess/neighbourhood-membership.json'
import neighbourhoods from '$data/preprocess/neighbourhoods.json'
import orbits from '$data/preprocess/orbits.json'
import planets from '$data/preprocess/planets.json'
import stars from '$data/preprocess/stars.json'
import systems from '$data/preprocess/systems.json'
import visibleSystems from '$data/preprocess/visible-systems.json'
import systemMembership from '$data/preprocess/system-membership.json'
import type { AstroJSON } from '$types/AstroJSON'
import { SingleBar } from 'cli-progress'
dotenv.config({ path: path.resolve(process.cwd(), '../.env') }) // Load project root .env

// Initialize core driver connection
const driver = neo4j.driver(
	process.env.NEO4J_URI!,
	neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
)
const session = driver.session({ database: 'neo4j' })
const BATCH_SIZE = 2000

// Synchronise local graph file data with the callable local Neo4J instance
const syncLocalInstance = async () => {
	console.log(
		`Synchronising ${galaxies.length} galaxies, ${systems.length} systems, ${stars.length} stars, ${planets.length} planets, ${neighbourhoods.length} neighbourhoods, ${orbits.length} orbits, ${galaxyMembership.length} galaxy-membership, ${neighbourhoodMembership.length} neighbourhood-membership ${(visibleSystems as any).length} visible-systems with Neo4J.`,
	)

	// Clear database
	await session.run('MATCH (n) DETACH DELETE n')
	await session.run('MATCH ()-[e]->() DELETE e')
	console.log('Cleared existing database.')

	// Organise data into nodes and edges
	const graph = {
		nodes: {
			Galaxy: galaxies as AstroJSON.Neo4J.Node.Galaxy[],
			System: systems as AstroJSON.Neo4J.Node.System[],
			Star: stars as unknown as AstroJSON.Neo4J.Node.Star[],
			Planet: planets as unknown as AstroJSON.Neo4J.Node.Planet[],
			Neighbourhood:
				neighbourhoods as AstroJSON.Neo4J.Node.Neighbourhood[],
		},
		edges: {
			ORBITS: orbits as unknown as AstroJSON.Neo4J.Edge.Orbit[],
			IN_GALAXY: galaxyMembership as AstroJSON.Neo4J.Edge.Child[],
			IN_SYSTEM: systemMembership as AstroJSON.Neo4J.Edge.Child[],
			IN_NEIGHBOURHOOD:
				neighbourhoodMembership as AstroJSON.Neo4J.Edge.Child[],
			SEES: visibleSystems as AstroJSON.Neo4J.Edge.Sees[],
		},
		metadata: {
			nodeCount:
				galaxies.length +
				systems.length +
				stars.length +
				planets.length +
				neighbourhoods.length,
			edgeCount:
				orbits.length +
				galaxyMembership.length +
				neighbourhoodMembership.length +
				(visibleSystems as any).length +
				systemMembership.length,
		},
	}

	// Add uniqueness constraints for node id indexing
	for (const label of Object.keys(graph.nodes))
		await session.run(`
			CREATE CONSTRAINT ${label}_id IF NOT EXISTS
			FOR (n:${label})
			REQUIRE n.id IS UNIQUE
		`)
	console.log('Added uniqueness constraints for nodes.')

	// Create each node
	const nodeProgress = new SingleBar({})
	nodeProgress.start(graph.metadata.nodeCount, 0)
	for (const [label, nodes] of Object.entries(graph.nodes)) {
		for (let b = 0; b < Math.ceil(nodes.length / BATCH_SIZE); b++) {
			const batch = nodes.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE)
			await session.run(
				`UNWIND $nodes AS node
					CREATE (n:${label} { id: node.id })
					SET n += node`,
				{ nodes: batch },
			)
			nodeProgress.increment(batch.length)
		}
	}
	nodeProgress.stop()
	const nodeCount = await session.run('MATCH (n) RETURN count(n) AS count')
	console.log(
		`Created ${nodeCount.records[0].get('count')} nodes (expected: ${graph.metadata.nodeCount}).`,
	)

	// Create each edge
	const edgeProgress = new SingleBar({})
	edgeProgress.start(graph.metadata.edgeCount, 0)
	for (const [label, edges] of Object.entries(graph.edges)) {
		const relationshipType = label.split('_')[0] // e.g., ORBITS, SEES, IN
		const sourceType =
			label === 'ORBITS'
				? 'Planet'
				: label === 'SEES'
					? 'System'
					: label === 'IN_GALAXY'
						? 'Neighbourhood'
						: label === 'IN_SYSTEM'
							? 'Star'
							: label === 'IN_NEIGHBOURHOOD'
								? 'System'
								: ''
		const targetType =
			label === 'ORBITS'
				? 'Star'
				: label === 'SEES'
					? 'Neighbourhood'
					: label === 'IN_GALAXY'
						? 'Galaxy'
						: label === 'IN_SYSTEM'
							? 'System'
							: label === 'IN_NEIGHBOURHOOD'
								? 'Neighbourhood'
								: ''
		for (let b = 0; b < Math.ceil(edges.length / BATCH_SIZE); b++) {
			const batch = edges.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE)
			await session.run(
				`UNWIND $edges AS edge
					MATCH (a:${sourceType} { id: edge.source })
					MATCH (b:${targetType} { id: edge.target })
					CREATE (a)-[e:${relationshipType}]->(b)
					SET e += edge`,
				{ edges: batch },
			)
			edgeProgress.increment(batch.length)
		}
	}
	edgeProgress.stop()
	const edgeCount = await session.run(
		'MATCH ()-[e]->() RETURN count(e) AS count',
	)
	console.log(
		`Created ${edgeCount.records[0].get('count')} edges (expected: ${graph.metadata.edgeCount}).`,
	)

	// Smoke test a small subgraph looks as expected
	const subgraph = await session.run(
		`MATCH (system:System { id: 'Solar System' })
	OPTIONAL MATCH (star:Star)-[:IN]->(system)
	OPTIONAL MATCH (planet:Planet)-[:ORBITS]->(star)
	OPTIONAL MATCH (system)-[:IN]->(neighbourhood:Neighbourhood)
	OPTIONAL MATCH (neighbourhood)-[:IN]->(galaxy:Galaxy)
	RETURN *`,
	)
	console.log(
		'Sample subgraph:',
		subgraph.records.map((r) => r.toObject()),
	)

	// Clean up to finish
	await session.close()
	await driver.close()
	console.log('Graph database sync completed successfully.')
}

syncLocalInstance().catch((error) => {
	console.error(error)
	process.exit(1)
})
