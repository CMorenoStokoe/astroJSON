import {
	IMPUTED_STAR_CHROMOSPHERIC_ACTIVITY,
	IMPUTED_STAR_LUMINOSITY,
	IMPUTED_STAR_RADIUS,
	IMPUTED_STAR_TEMPERATURE,
	IMPUTED_STAR_APPARENT_MAGNITUDE,
	IMPUTED_STAR_K_MAGNITUDE,
	IMPUTED_STAR_W1_MAGNITUDE,
	IMPUTED_STAR_W4_MAGNITUDE,
	IMPUTED_COORD,
} from '../constants/IMPUTED_VALUES'
import { AstroJSON } from '../../../../types/AstroJSON'

// Collect basic tests to perform during the pipeline

// Star properties
export const isImputedStarTemperature = (
	star: AstroJSON.Schema.Star,
): boolean => Number(star.temperature) === IMPUTED_STAR_TEMPERATURE
export const isImputedStarRadius = (star: AstroJSON.Schema.Star): boolean =>
	Number(star.radius) === IMPUTED_STAR_RADIUS
export const isImputedStarLuminosity = (star: AstroJSON.Schema.Star): boolean =>
	Number(star.luminosity) === IMPUTED_STAR_LUMINOSITY
export const isImputedStarChromosphericActivity = (
	star: AstroJSON.Schema.Star,
): boolean =>
	Number(star.chromosphericActivity) === IMPUTED_STAR_CHROMOSPHERIC_ACTIVITY

// Star magnitudes
export const isInvalidMagnitude = (
	value: unknown,
	min: number,
	max: number,
): boolean =>
	typeof value !== 'number' ||
	!Number.isFinite(value) ||
	value < min ||
	value > max

export const isInvalidTemperature = (star: AstroJSON.Schema.Star): boolean =>
	typeof star.temperature !== 'number' ||
	!Number.isFinite(star.temperature) ||
	star.temperature < 1000 ||
	star.temperature > 50000

export const isInvalidAbsoluteMagnitude = (
	system: AstroJSON.Schema.System | AstroJSON.Schema.Star,
): boolean => {
	const brightness =
		(system as AstroJSON.Schema.System).brightness ??
		(system as AstroJSON.Schema.Star).luminosity
	return (
		typeof brightness !== 'number' ||
		!Number.isFinite(brightness) ||
		brightness < -15 ||
		brightness > 25
	)
}

export const isInvalidApparentMagnitude = (
	visibleSystem: AstroJSON.Neo4J.Edge.Sees,
): boolean =>
	typeof visibleSystem.apparentBrightness !== 'number' ||
	!Number.isFinite(visibleSystem.apparentBrightness) ||
	visibleSystem.apparentBrightness < -30 ||
	visibleSystem.apparentBrightness > 50

// Coords
export const isImputedCoord = (
	body: AstroJSON.Schema.System | AstroJSON.Schema.Neighbourhood,
): boolean =>
	[...((body as any).centrum ?? (body as any).coords)].every(
		(value) => Number(value) === IMPUTED_COORD,
	)
export const isCentralCoord = (
	body: AstroJSON.Schema.System | AstroJSON.Schema.Neighbourhood,
): boolean =>
	[...((body as any).centrum ?? (body as any).coords)].every(
		(value) => Number(value) === 0,
	)
export const isInvalidNormalisedDirectionalVector = (
	sees: AstroJSON.Neo4J.Edge.Sees,
): boolean => {
	const [x, y, z] = sees.direction
	const isFinite = [x, y, z].every(
		(value) => typeof value === 'number' && Number.isFinite(value),
	)
	const magnitude = Math.sqrt(x * x + y * y + z * z)
	const isNormalised = Math.abs(magnitude - 1) <= 1e-6
	const isAllZero = x === 0 && y === 0 && z === 0
	const isValid = isFinite && isNormalised && !isAllZero

	return !isValid
}
