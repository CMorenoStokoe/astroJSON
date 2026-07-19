import {
	getSystem,
	MINIFIED_SYSTEM_FIELDS,
} from './api/NASA/exoplanet-catalog/getSystem'
import { getSystems as getHorizonsSystems } from './api/NASA/horizons/getSolarSystemPlanet/getSystems'

import allSystems from './api/NASA/exoplanet-catalog/sy_name.index.json'

import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = 'data/raw'
const OUT_FILE_SYS = path.join(OUT_DIR, 'systems-exogenous.csv')
const WRITE_BATCH_SIZE = 250

type SystemRecord =
	| Awaited<ReturnType<typeof getSystem>>[number]
	| Awaited<ReturnType<typeof getHorizonsSystems>>[number]

const systemRecordToCsv = (record: SystemRecord) =>
	Object.values(record)
		.map((value) => (value === null ? '' : value))
		.join(',')

const readExistingSystemNames = () => {
	if (!fs.existsSync(OUT_FILE_SYS)) return new Set<string>()

	return new Set<string>(
		fs
			.readFileSync(OUT_FILE_SYS, 'utf-8')
			.split('\n')
			.slice(1)
			.map((line: string) => line.split(',')[0])
			.filter(Boolean),
	)
}

const appendSystemBatch = (
	records: SystemRecord[],
	existingSystemNames: Set<string>,
) => {
	let appendedCount = 0

	for (let index = 0; index < records.length; index += WRITE_BATCH_SIZE) {
		const chunk = records
			.slice(index, index + WRITE_BATCH_SIZE)
			.filter((record) => !existingSystemNames.has(record.sy_name))

		if (!chunk.length) continue

		fs.appendFileSync(
			OUT_FILE_SYS,
			`${chunk.map(systemRecordToCsv).join('\n')}\n`,
		)

		for (const record of chunk) existingSystemNames.add(record.sy_name)
		appendedCount += chunk.length
	}

	return appendedCount
}

const run = async () => {
	/**
	 * # Planet containing systems
	 *  Fetches the full exoplanet ID list, then queries each planet sequentially.
	 */

	const allSystemNames = allSystems.sy_names
	const existingSystemNames = readExistingSystemNames()
	let systemNamesToFetch = allSystemNames

	if (existingSystemNames.size) {
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
	let bufferedSystemRecords: SystemRecord[] = []
	for (const { sy_name } of systemNamesToFetch) {
		const systemData = await getSystem(sy_name)
		bufferedSystemRecords.push(...systemData)
		if (bufferedSystemRecords.length >= WRITE_BATCH_SIZE) {
			appendSystemBatch(bufferedSystemRecords, existingSystemNames)
			bufferedSystemRecords = []
		}
		doneSystemCount++
		console.log(
			`Fetched ${sy_name} (${doneSystemCount}/${allSystemNames.length})`,
		)
	}
	appendSystemBatch(bufferedSystemRecords, existingSystemNames)

	/**
	 * # Endogenous system (sol)
	 *  Fetches sol as an additional system not included in the exoplanet archive
	 */
	const horizonsSystems = await getHorizonsSystems()
	const appendedHorizonsSystems = appendSystemBatch(
		horizonsSystems,
		existingSystemNames,
	)
	if (appendedHorizonsSystems) {
		console.log(
			`Fetched ${appendedHorizonsSystems} endogenous systems (sol).`,
		)
	}

	/**
	 * # Non-planet containing systems
	 *  Fetches additional systems which have no known planets
	 */
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
