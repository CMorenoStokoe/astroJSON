import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import neo4j, { Driver, Session } from 'neo4j-driver'

dotenv.config({ path: path.resolve(process.cwd(), '../.env') })

type AstroNode = { type: string }
type AstroEdge = { type: string }

const requiredEnv = ['NEO4J_URI', 'NEO4J_USER', 'NEO4J_PASSWORD'] as const
for (const envKey of requiredEnv) {
	if (!process.env[envKey]) {
		throw new Error(`Missing required environment variable: ${envKey}`)
	}
}

const readGraphPayload = (): { nodes: AstroNode[]; edges: AstroEdge[] } => {
	const candidatePaths = [
		path.resolve(process.cwd(), 'data/raw/universe-graph-exogenous.json'),
		path.resolve(
			process.cwd(),
			'../data/raw/universe-graph-exogenous.json',
		),
	]

	const inputFile = candidatePaths.find((filePath) => fs.existsSync(filePath))
	if (!inputFile) {
		throw new Error(
			'Could not find universe-graph-exogenous.json in data/raw',
		)
	}

	const payload = JSON.parse(fs.readFileSync(inputFile, 'utf8')) as {
		nodes: AstroNode[]
		edges: AstroEdge[]
	}

	return payload
}

const toNumber = (value: unknown): number => {
	if (neo4j.isInt(value)) {
		return (value as neo4j.Integer).toNumber()
	}
	return Number(value)
}

const normalizeNeo4jUri = (uri: string): string =>
	uri.startsWith('neo4j://') ? uri.replace('neo4j://', 'bolt://') : uri

const driver: Driver = neo4j.driver(
	normalizeNeo4jUri(process.env.NEO4J_URI!),
	neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
)

test('Neo4j is connectable', async (t) => {
	const info = await driver.getServerInfo()
	assert.ok(
		info.address,
		'Expected Neo4j server address from connection handshake',
	)
})

test(
	'Neo4j contains the expected source graph data',
	{ timeout: 20000 },
	async (t) => {
		const { nodes, edges } = readGraphPayload()

		const expectedNodeIds = {
			Galaxy: nodes
				.filter((n) => n.type.toLowerCase() === 'galaxy')
				.map((n: any) => n.id),
			System: nodes
				.filter((n) => n.type.toLowerCase() === 'system')
				.map((n: any) => n.id),
			Star: nodes
				.filter((n) => n.type.toLowerCase() === 'star')
				.map((n: any) => n.id),
			Planet: nodes
				.filter((n) => n.type.toLowerCase() === 'planet')
				.map((n: any) => n.id),
		}

		const expectedEdges = edges.map((edge: any) => ({
			source: edge.source,
			target: edge.target,
			relType: edge.type.toLowerCase() === 'orbits' ? 'ORBITS' : 'IN',
		}))

		const session: Session = driver.session({ database: 'neo4j' })
		try {
			for (const [label, ids] of Object.entries(expectedNodeIds)) {
				const result = await session.run(
					`UNWIND $ids AS id MATCH (n:${label} {id: id}) RETURN count(n) AS matched`,
					{ ids },
				)
				const matched = toNumber(result.records[0].get('matched'))
				assert.equal(
					matched,
					ids.length,
					`Missing ${label} nodes in Neo4j. Expected ${ids.length}, found ${matched}.`,
				)
			}

			const allEdgesResult = await session.run(`
			MATCH (source)-[r]->(target)
			WHERE type(r) IN ['ORBITS', 'IN']
			RETURN source.id AS source, target.id AS target, type(r) AS relType
		`)

			const existingEdges = new Set(
				allEdgesResult.records.map((record) => {
					const source = String(record.get('source'))
					const target = String(record.get('target'))
					const relType = String(record.get('relType'))
					return `${source}|${relType}|${target}`
				}),
			)

			let matchedEdges = 0
			for (const edge of expectedEdges) {
				if (
					existingEdges.has(
						`${edge.source}|${edge.relType}|${edge.target}`,
					)
				) {
					matchedEdges += 1
				}
			}

			assert.equal(
				matchedEdges,
				expectedEdges.length,
				`Missing source relationships in Neo4j. Expected ${expectedEdges.length}, found ${matchedEdges}.`,
			)
		} finally {
			await session.close()
		}
	},
)

test.after(async () => {
	await driver.close()
})
