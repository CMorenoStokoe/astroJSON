import neo4j from 'neo4j-driver'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

// Load environment configuration relative to root context execution
dotenv.config({ path: path.resolve(process.cwd(), '../.env') })

const normalizeNeo4jUri = (uri: string): string =>
	uri.startsWith('neo4j://') ? uri.replace('neo4j://', 'bolt://') : uri

export const syncLocalInstance = async () => {
	console.log('Synchronising local graph data with Neo4J instance...')

	// Read and parse preprocessed graph payload
	const INPUT_FILE = path.join('data/raw', 'universe-graph-exogenous.json')
	const { nodes, edges } = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'))

	// Initialize core driver connection with target fallback validation
	const connectionUri = normalizeNeo4jUri(process.env.NEO4J_URI!)
	const username = process.env.NEO4J_USER!
	const password = process.env.NEO4J_PASSWORD!

	const driver = neo4j.driver(
		connectionUri,
		neo4j.auth.basic(username, password),
	)
	const session = driver.session({ database: 'neo4j' })

	// Step 1: Wipe database instance back to bare metal
	await session.run('MATCH (n) DETACH DELETE n')
	console.log(
		`Deleted all existing nodes and relationships in the Neo4J instance.`,
	)

	// Step 2: Establish lookup schema constraints across all structural categories
	const labels = ['Galaxy', 'System', 'Star', 'Planet']
	for (const label of labels) {
		await session.run(
			`CREATE CONSTRAINT IF NOT EXISTS FOR (n:${label}) REQUIRE n.id IS UNIQUE`,
		)
	}
	console.log(
		`Created uniqueness constraints for node labels: Galaxy, System, Star, Planet.`,
	)

	// Step 3: Native dynamic node creation using MERGE to cleanly handle duplicates
	for (const label of labels) {
		const filteredNodes = nodes.filter(
			(n: any) => n.type.toLowerCase() === label.toLowerCase(),
		)
		if (filteredNodes.length === 0) continue

		await session.run(
			`
            UNWIND $nodes AS node
            MERGE (n:${label} { id: node.id })
            ON CREATE SET n.pos = node.pos, n += node.data
            ON MATCH SET n.pos = node.pos, n += node.data
            `,
			{ nodes: filteredNodes },
		)
	}
	console.log(`Created ${nodes.length} nodes in the Neo4J instance.`)

	// Step 4: Batch calculate and write planetary Keplerian orbit lines
	// FIXED: Added strict labels (:Planet and :Star) so Neo4j can hit your unique ID indexes immediately.
	await session.run(
		`
        UNWIND $edges AS edge
        MATCH (source:Planet {id: edge.source})
        MATCH (target:Star {id: edge.target})
        MERGE (source)-[r:ORBITS]->(target)
        SET r = {
            a: edge.path.a, e: edge.path.e, i: edge.path.i,
            O: edge.path.O, w: edge.path.w, M: edge.path.M,
            P: edge.path.P, isCb: edge.path.isCb
        }
        `,
		{ edges: edges.filter((e: any) => e.type === 'orbits') },
	)
	console.log(
		`Created ${edges.filter((e: any) => e.type === 'orbits').length} ORBITS relationships in the Neo4J instance.`,
	)

	// Step 5: Batch write hierarchical spatial nest constraints
	// FIXED: The generic MATCH was rewritten into separate label-specific sweeps.
	// Because 'IN' links various combinations (Planet->System, Star->System, System->Galaxy),
	// separating these steps forces Neo4j to use the constraints instead of scanning the whole DB.
	const inEdges = edges.filter((e: any) => e.type === 'in')

	// 5a. Link Systems to Galaxies
	await session.run(
		`
        UNWIND $edges AS edge
        MATCH (source:System {id: edge.source})
        MATCH (target:Galaxy {id: edge.target})
        MERGE (source)-[:IN]->(target)
        `,
		{ edges: inEdges },
	)

	// 5b. Link Stars to Systems
	await session.run(
		`
        UNWIND $edges AS edge
        MATCH (source:Star {id: edge.source})
        MATCH (target:System {id: edge.target})
        MERGE (source)-[:IN]->(target)
        `,
		{ edges: inEdges },
	)

	// 5c. Link Planets to Systems
	await session.run(
		`
        UNWIND $edges AS edge
        MATCH (source:Planet {id: edge.source})
        MATCH (target:System {id: edge.target})
        MERGE (source)-[:IN]->(target)
        `,
		{ edges: inEdges },
	)

	console.log(
		`Created ${inEdges.length} IN relationships in the Neo4J instance.`,
	)

	console.log('Graph database sync completed successfully.')
	await session.close()
	await driver.close()
}
