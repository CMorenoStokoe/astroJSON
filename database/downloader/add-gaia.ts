import { ESA } from '$types/ESA'
import fs from 'node:fs'
import path from 'node:path'
import { getShard } from './api/ESA/gaia/getShard'
import { streamSaveStarsFromGaiaShards } from './lib/schema/streamSaveStarsFromGaiaShards'
import { getGaiaShardIDs } from './api/ESA/gaia/getShardIDs'

const OUT_DIR = path.join('data', 'raw')
const MEMORY_FILE = path.join(OUT_DIR, '_memory-processed-gaia-shards.csv')

// Add stars with Gaia data to the database (for those with no planets)
const addGaia = async () => {
	// Fetch all shard ids
	let shards = await getGaiaShardIDs()
	console.log(`Found ${shards.length} Gaia shards to process`)

	// Pickup from previous shard
	const processedShards = fs.readFileSync(MEMORY_FILE, 'utf-8').split('\n')
	const lastProcessedShard = processedShards[processedShards.length - 2]
	shards = shards.slice(shards.indexOf(lastProcessedShard) + 1)
	console.log(
		`Resuming from shard ${lastProcessedShard}, ${shards.length} shards remaining`,
	)

	// Process each remaining shard
	for (const [i, shard] of shards.entries()) {
		fs.appendFileSync(MEMORY_FILE, `${shard}\n`)

		// Fetch matching Gaia source and physical-parameter streams
		console.log(`Getting shard ${shard}`)
		const { sourceStream, physicalStream } = await getShard(shard)

		// Extract matching fields and write them to one CSV
		console.log(`Processing shard ${shard}`)
		await streamSaveStarsFromGaiaShards(sourceStream, physicalStream)
		console.log(
			`Finished shard ${shard} (${(
				((i + 1) / shards.length) *
				100
			).toFixed(0)}% complete)`,
		)
	}

	// Finish
	console.log(`Finished writing Gaia stars`)
}

addGaia().catch((error) => {
	console.error(error)
	process.exit(1)
})
