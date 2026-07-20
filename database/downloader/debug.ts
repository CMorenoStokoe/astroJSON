import fs from 'node:fs'
import path from 'node:path'
import { AstroJSON } from '../../types/AstroJSON'
import {
	isImputedCoord,
	isImputedStarChromosphericActivity,
	isImputedStarLuminosity,
	isImputedStarRadius,
	isImputedStarTemperature,
	isInvalidAbsoluteMagnitude,
	isInvalidApparentMagnitude,
	isInvalidMagnitude,
	isInvalidTemperature,
} from './lib/test/tests'

const OUT_DIR = path.join('data', 'preprocess')
const OUT_FILE_SYSTEMS = path.join(OUT_DIR, 'systems.json')
const OUT_FILE_VISIBLE_SYSTEMS = path.join(OUT_DIR, 'visible-systems.json')
const OUT_FILE_STARS = path.join(OUT_DIR, 'stars.json')
const OUT_FILE_DEBUG = path.join(OUT_DIR, '_debug.json')

// Perform debug to identify bad data
const performDebug = async () => {
	const readJson = async <T>(file: string): Promise<T> =>
		JSON.parse(await fs.promises.readFile(file, 'utf8'))

	// Get data from preprocessed files
	const systems = await readJson<AstroJSON.Schema.System[]>(OUT_FILE_SYSTEMS)
	const visibleSystems = await readJson<AstroJSON.Neo4J.Edge.Sees[]>(
		OUT_FILE_VISIBLE_SYSTEMS,
	)
	const stars = await readJson<AstroJSON.Schema.Star[]>(OUT_FILE_STARS)

	// Check that magnitudes are within valid ranges
	const invalidSystemAbsoluteMagnitudes = systems.filter(
		isInvalidAbsoluteMagnitude,
	)
	const invalidStarTemperatures = stars.filter(isInvalidTemperature)
	const invalidVisibleSystemApparentMagnitudes = visibleSystems.filter(
		isInvalidApparentMagnitude,
	)

	// Count imputed values with EPSILON
	const imputedStarTemperatures = stars.filter(isImputedStarTemperature)
	const imputedStarRadii = stars.filter(isImputedStarRadius)
	const imputedStarLuminosities = stars.filter(isImputedStarLuminosity)
	const imputedStarChromosphericActivities = stars.filter(
		isImputedStarChromosphericActivity,
	)
	const imputedSystemCoords = systems.filter(isImputedCoord)
	const imputedNeighbourhoodCoords = systems.filter(isImputedCoord)

	// Write out _debug file for inspection
	const debugData = {
		invalidSystemAbsoluteMagnitudes,
		invalidStarTemperatures,
		invalidVisibleSystemApparentMagnitudes,
		imputedStarTemperatures,
		imputedStarRadii,
		imputedStarLuminosities,
		imputedStarChromosphericActivities,
		imputedSystemCoords,
	}
	await fs.promises.writeFile(
		OUT_FILE_DEBUG,
		JSON.stringify(debugData, null, 2),
		'utf8',
	)
	console.log('Debug:', {
		invalidSystemAbsoluteMagnitudes: invalidSystemAbsoluteMagnitudes.length,
		invalidStarTemperatures: invalidStarTemperatures.length,
		invalidVisibleSystemApparentMagnitudes:
			invalidVisibleSystemApparentMagnitudes.length,
		imputedStarTemperatures: imputedStarTemperatures.length,
		imputedStarRadii: imputedStarRadii.length,
		imputedStarLuminosities: imputedStarLuminosities.length,
		imputedStarChromosphericActivities:
			imputedStarChromosphericActivities.length,
		imputedSystemCoords: imputedSystemCoords.length,
		imputedNeighbourhoodCoords: imputedNeighbourhoodCoords.length,
	})
}

performDebug().catch((error) => {
	console.error(error)
	process.exit(1)
})
