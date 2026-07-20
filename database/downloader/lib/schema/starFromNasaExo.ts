import { AstroJSON } from '../../../../types/AstroJSON'
import { NASA } from '../../../../types/NASA'
import {
	IMPUTED_STAR_CHROMOSPHERIC_ACTIVITY,
	IMPUTED_STAR_LUMINOSITY,
	IMPUTED_STAR_RADIUS,
	IMPUTED_STAR_TEMPERATURE,
} from '../constants/IMPUTED_VALUES'
import { isInvalidAbsoluteMagnitude } from '../test/tests'

// Creates an AstroJSON schema node for a star from a NASA Minified Exoplanet Archive record
export const starFromNasaExo = (
	record: NASA.MinifiedExoplanetArchiveStarRecord,
): {
	starNode: AstroJSON.Neo4J.Node.Star
	systemMembershipEdge: AstroJSON.Neo4J.Edge.Child
} | null => {
	// Guarantee fields are filled
	const st_teff = record.st_teff
		? Number(record.st_teff)
		: IMPUTED_STAR_TEMPERATURE
	const st_rad = record.st_rad ? Number(record.st_rad) : IMPUTED_STAR_RADIUS
	const st_lum = record.st_lum
		? Number(record.st_lum)
		: IMPUTED_STAR_LUMINOSITY
	const st_log_rhk = record.st_log_rhk
		? Number(record.st_log_rhk)
		: IMPUTED_STAR_CHROMOSPHERIC_ACTIVITY

	// Parse the record and create a star node
	const starNode: AstroJSON.Neo4J.Node.Star = {
		id: record.hostname,
		type: 'star',
		name: record.hostname, // Standardized host star name

		// Appearance
		temperature: st_teff, // Effective Temperature (Kelvin, for color)
		radius: st_rad, // Stellar Radius (Solar radii)
		luminosity: st_lum, // Stellar Luminosity (log(L/L_sun))
		chromosphericActivity: st_log_rhk, // Stellar Chromospheric Activity index (log R'HK, measures how magnetically violent the star is. High values mean massive sunspots, violent solar flares, and Coronal Mass Ejections)

		// Kinematics and rotation
		radialVelocity: record.st_vsin, // Radial Velocity relative to barycenter (km/s, for circumbinary systems)
		period: record.st_rotp, // Stellar Rotation Period (Days)

		// Circumbinary data
		mass: record.st_mass, // Stellar Mass (Solar masses, for circumbinary systems)
	}

	// Create system membership record
	const systemMembershipEdge: AstroJSON.Neo4J.Edge.Child = {
		id: `${starNode.id}|${record.sy_name}`,
		source: starNode.id,
		target: record.sy_name,
		type: 'in',
	}

	// Validate data
	if (isInvalidAbsoluteMagnitude(starNode))
		console.warn(
			`System node ${starNode.id} has invalid absolute magnitude: ${starNode.luminosity}`,
		)

	return { starNode, systemMembershipEdge }
}
