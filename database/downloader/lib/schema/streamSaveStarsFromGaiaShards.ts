import fs from 'node:fs'
import { once } from 'node:events'
import type { Readable } from 'node:stream'
import { parse } from 'csv-parse'

const OUT_DIR = 'data/raw'
const OUT_FILE = `${OUT_DIR}/stars-gaia-exogenous.csv` // existing rows include at least head: designation,ra,dec,parallax,teff_gspphot,radius_gspphot,lum_flame

// Extract relevant Gaia fields from matching streams and write one merged CSV
export const streamSaveStarsFromGaiaShards = async (
	sourceStream: Readable,
	physicalStream: Readable,
) => {
	// Parse both CSV streams row-by-row
	const sourceRows: AsyncIterable<{
		// Gaia source data
		source_id: string
		ra: string
		dec: string
		parallax: string
	}> = sourceStream.pipe(
		parse({
			columns: true,
			comment: '#', // skip comment lines
			skip_empty_lines: true,
		}),
	)
	const physicalRows: AsyncIterable<{
		// Astrophysical parameters
		source_id: string
		teff_gspphot: string
		radius_gspphot: string
		lum_flame: string
	}> = physicalStream.pipe(
		parse({
			columns: true,
			comment: '#',
			skip_empty_lines: true,
		}),
	)

	// Initialise iterators to walk through both streams in parallel
	const sourceIterator = sourceRows[Symbol.asyncIterator]()
	const physicalIterator = physicalRows[Symbol.asyncIterator]()
	let sourceResult = await sourceIterator.next()
	let physicalResult = await physicalIterator.next()

	// Initialise
	const output = fs.createWriteStream(OUT_FILE, { flags: 'a' })

	// Walk through both streams and merge matching source IDs
	let rowCount = 0
	const PROGRESS_POLL = 100000
	while (!sourceResult.done && !physicalResult.done) {
		// Compare source_ids as bitints to avoid string comparison issues with large numbers
		const sourceId = BigInt(sourceResult.value.source_id)
		const physicalId = BigInt(physicalResult.value.source_id)

		// Source has no matching physical row
		if (sourceId < physicalId) {
			sourceResult = await sourceIterator.next()
			continue
		}

		// Physical row has no matching source row
		if (physicalId < sourceId) {
			physicalResult = await physicalIterator.next()
			continue
		}

		// Capture only the fields we need and only then if they are populated to save space
		const populated = (
			value: string | null | undefined,
			precision: number,
		) =>
			value === null || value === undefined || value === 'null'
				? ''
				: Number(value).toFixed(precision)
		const row = [
			populated(sourceResult.value.source_id, 0),
			populated(sourceResult.value.ra, 3),
			populated(sourceResult.value.dec, 3),
			populated(sourceResult.value.parallax, 2),
			populated(physicalResult.value.teff_gspphot, 0),
			populated(physicalResult.value.radius_gspphot, 2),
			populated(physicalResult.value.lum_flame, 1),
		].join(',')

		// Write but only once the output stream can handle it
		if (!output.write(`${row}\n`)) await once(output, 'drain')

		// Log progress indicator
		rowCount++
		if (rowCount % PROGRESS_POLL === 0)
			console.log(`\x1b[90m ==> ${rowCount} rows\x1b[0m`)

		// Move to next rows in both streams
		sourceResult = await sourceIterator.next()
		physicalResult = await physicalIterator.next()
	}

	// Return once write operations are complete
	output.end()
	await once(output, 'finish')
}
