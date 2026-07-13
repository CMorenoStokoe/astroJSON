import { syncLocalInstance } from './lib/neo4j/sync-local-instance'

// Synchronises local graph file data with the callable local Neo4J instance
const run = async () => {
	// # Sync
	console.log('Synchronising local graph data with Neo4J instance...')
	syncLocalInstance()
	console.log(
		'Synchronised local graph data with Neo4J instance successfully.',
	)
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
