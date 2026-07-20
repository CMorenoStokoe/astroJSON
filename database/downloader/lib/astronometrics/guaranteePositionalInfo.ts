import { AstroJSON } from '../../../../types/AstroJSON'
import { NASA } from '../../../../types/NASA'

// Helper to parse numbers
const parseNumber = (value: unknown): number | null =>
	value === null ||
	value === undefined ||
	(typeof value === 'string' && value.trim() === '')
		? null
		: Number.isFinite(Number(value))
			? Number(value)
			: null

// Convert galactic longitude/latitude into equatorial RA/Dec
const galacticToEquatorial = (
	glon: number,
	glat: number,
): {
	ra: number
	dec: number
} => {
	const degreesToRadians = Math.PI / 180
	const radiansToDegrees = 180 / Math.PI

	const longitude = glon * degreesToRadians
	const latitude = glat * degreesToRadians

	const galacticX = Math.cos(latitude) * Math.cos(longitude)
	const galacticY = Math.cos(latitude) * Math.sin(longitude)
	const galacticZ = Math.sin(latitude)

	const equatorialX =
		-0.0548755604 * galacticX +
		0.4941094279 * galacticY -
		0.867666149 * galacticZ

	const equatorialY =
		-0.8734370902 * galacticX -
		0.44482963 * galacticY -
		0.1980763734 * galacticZ

	const equatorialZ =
		-0.4838350155 * galacticX +
		0.7469822445 * galacticY +
		0.4559837762 * galacticZ

	const ra =
		(((Math.atan2(equatorialY, equatorialX) * radiansToDegrees) % 360) +
			360) %
		360

	const dec =
		Math.asin(Math.max(-1, Math.min(1, equatorialZ))) * radiansToDegrees

	return { ra, dec }
}

// Guarantee as best as possible that for a given system/star its position is recorded
export const guaranteePositionalInfo = (
	system: NASA.MinifiedExoplanetArchiveSystemRecord,
): {
	ra: number
	dec: number
	sy_dist: number
} => {
	// Ensure distance measures
	const rawDistance = parseNumber(system.sy_dist)
	const parallax = parseNumber(system.sy_plx)
	const sy_dist =
		system.sy_name === 'Solar System'
			? 0
			: rawDistance !== null && rawDistance > 0
				? rawDistance
				: parallax !== null && parallax > 0
					? 1000 / parallax
					: 1000

	// Ensure directional measures
	const rawRa = parseNumber(system.ra)
	const rawDec = parseNumber(system.dec)

	// Return RA/Dec if valid
	if (
		rawRa !== null &&
		rawRa >= 0 &&
		rawRa < 360 &&
		rawDec !== null &&
		rawDec >= -90 &&
		rawDec <= 90
	) {
		return {
			ra: rawRa,
			dec: rawDec,
			sy_dist,
		}
	}

	// If RA/Dec is invalid, try to convert from galactic coordinates
	const glon = parseNumber(system.glon)
	const glat = parseNumber(system.glat)

	if (
		glon !== null &&
		glon >= 0 &&
		glon < 360 &&
		glat !== null &&
		glat >= -90 &&
		glat <= 90
	) {
		return {
			...galacticToEquatorial(glon, glat),
			sy_dist,
		}
	}

	// If all else fails, return a default position
	return {
		ra: 0,
		dec: 0,
		sy_dist,
	}
}
