import {
	getExoPlanet,
	MINIFIED_FIELDS,
} from './api/NASA/exoplanet-catalog/getExoPlanet'

import allExoPlanets from './api/NASA/exoplanet-catalog/pl_name.index.json'

import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = 'data/raw'
const OUT_FILE_EXO = path.join(OUT_DIR, 'planets-exogenous.csv')

// Fetches the full exoplanet ID list, then queries each planet sequentially.
const run = async () => {
	// # Exoplanets
	// Download exoplanet data
	const allExoPlanetNames = allExoPlanets.pl_names
	let exoPlanetNamesToFetch = allExoPlanetNames
	if (fs.existsSync(OUT_FILE_EXO)) {
		const existingPlanetData: string = fs.readFileSync(
			OUT_FILE_EXO,
			'utf-8',
		)
		const existingPlanetNames = new Set(
			existingPlanetData
				.split('\n')
				.slice(1) // Skip header
				.map((line) => line.split(',')[0]), // Get the first column (pl_name)
		)
		const remainingExoPlanets = allExoPlanetNames.filter(
			({ pl_name }) => !existingPlanetNames.has(pl_name),
		)
		exoPlanetNamesToFetch = remainingExoPlanets
		console.log(
			`Found ${existingPlanetNames.size} existing exoplanets. Fetching ${remainingExoPlanets.length} remaining exoplanets.`,
		)
	} else {
		const planetDataHeader = MINIFIED_FIELDS.join(',') + '\n'
		fs.writeFileSync(OUT_FILE_EXO, planetDataHeader) // Clear the file before writing
		console.log(
			`No existing exoplanet data found. Fetching all ${allExoPlanetNames.length} exoplanets.`,
		)
	}
	let doneExoCount = 0
	for (const { pl_name } of exoPlanetNamesToFetch) {
		// Get data and save to file
		const planetData = await getExoPlanet(pl_name)
		// Save to filesystem
		const planetDataCsv =
			planetData
				.map((record) =>
					Object.values(record)
						.map((value) => (value === null ? '' : value))
						.join(','),
				)
				.join('\n') + '\n'
		fs.appendFileSync(OUT_FILE_EXO, planetDataCsv)
		doneExoCount++
		console.log(
			`Fetched ${pl_name} (${doneExoCount}/${allExoPlanetNames.length})`,
		)
	}
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
