import {
	getStar,
	MINIFIED_STAR_FIELDS,
} from './api/NASA/exoplanet-catalog/getStar'
import allStars from './api/NASA/exoplanet-catalog/hostname.index.json'

import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = 'data/raw'
const OUT_FILE_STAR = path.join(OUT_DIR, 'stars-exogenous.csv')

// Fetches the full exoplanet ID list, then queries each planet sequentially.
const run = async () => {
	// # Stars
	const allStarNames = allStars.hostnames
	let starNamesToFetch = allStarNames

	if (fs.existsSync(OUT_FILE_STAR)) {
		const existingStarData: string = fs.readFileSync(OUT_FILE_STAR, 'utf-8')
		const existingStarNames = new Set(
			existingStarData
				.split('\n')
				.slice(1)
				.map((line) => line.split(',')[0]),
		)
		const remainingStars = allStarNames.filter(
			({ hostname }) => !existingStarNames.has(hostname),
		)
		starNamesToFetch = remainingStars
		console.log(
			`Found ${existingStarNames.size} existing stars. Fetching ${remainingStars.length} remaining stars.`,
		)
	} else {
		const starDataHeader = MINIFIED_STAR_FIELDS.join(',') + '\n'
		fs.writeFileSync(OUT_FILE_STAR, starDataHeader)
		console.log(
			`No existing star data found. Fetching all ${allStarNames.length} stars.`,
		)
	}

	let doneStarCount = 0
	for (const { hostname } of starNamesToFetch) {
		const starData = await getStar(hostname)
		const starDataCsv =
			starData
				.map((record) =>
					Object.values(record)
						.map((value) => (value === null ? '' : value))
						.join(','),
				)
				.join('\n') + '\n'
		fs.appendFileSync(OUT_FILE_STAR, starDataCsv)
		doneStarCount++
		console.log(
			`Fetched ${hostname} (${doneStarCount}/${allStarNames.length})`,
		)
	}
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
