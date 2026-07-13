import {
	getSystem,
	MINIFIED_SYSTEM_FIELDS,
} from './api/NASA/exoplanet-catalog/getSystem'

import allSystems from './api/NASA/exoplanet-catalog/sy_name.index.json'

import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = 'data/raw'
const OUT_FILE_SYS = path.join(OUT_DIR, 'systems-exogenous.csv')

// Fetches the full exoplanet ID list, then queries each planet sequentially.
const run = async () => {
	// # Systems
	const allSystemNames = allSystems.sy_names
	let systemNamesToFetch = allSystemNames

	if (fs.existsSync(OUT_FILE_SYS)) {
		const existingSystemData: string = fs.readFileSync(
			OUT_FILE_SYS,
			'utf-8',
		)
		const existingSystemNames = new Set(
			existingSystemData
				.split('\n')
				.slice(1)
				.map((line) => line.split(',')[0]),
		)
		const remainingSystems = allSystemNames.filter(
			({ sy_name }) => !existingSystemNames.has(sy_name),
		)
		systemNamesToFetch = remainingSystems
		console.log(
			`Found ${existingSystemNames.size} existing systems. Fetching ${remainingSystems.length} remaining systems.`,
		)
	} else {
		const systemDataHeader = MINIFIED_SYSTEM_FIELDS.join(',') + '\n'
		fs.writeFileSync(OUT_FILE_SYS, systemDataHeader)
		console.log(
			`No existing system data found. Fetching all ${allSystemNames.length} systems.`,
		)
	}

	let doneSystemCount = 0
	for (const { sy_name } of systemNamesToFetch) {
		const systemData = await getSystem(sy_name)
		const systemDataCsv =
			systemData
				.map((record) =>
					Object.values(record)
						.map((value) => (value === null ? '' : value))
						.join(','),
				)
				.join('\n') + '\n'
		fs.appendFileSync(OUT_FILE_SYS, systemDataCsv)
		doneSystemCount++
		console.log(
			`Fetched ${sy_name} (${doneSystemCount}/${allSystemNames.length})`,
		)
	}
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
