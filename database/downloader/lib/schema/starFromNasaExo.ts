import { AstroJSON } from '../../../../types/AstroJSON'
import { NASA } from '../../../../types/NASA'

// Creates an AstroJSON schema node for a star from a NASA Minified Exoplanet Archive record
export const starFromNasaExo = (
	record: NASA.MinifiedExoplanetArchiveStarRecord,
): AstroJSON.Neo4J.Node.Star | null => {
	// Parse the record and create a star node
	const starNode: AstroJSON.Neo4J.Node.Star = {
		id: record.hostname,
		type: 'star',
		name: record.hostname, // Standardized host star name

		// Appearance
		temperature: record.st_teff, // Effective Temperature (Kelvin, for color)
		radius: record.st_rad, // Stellar Radius (Solar radii)
		luminosity: record.st_lum, // Stellar Luminosity (log(L/L_sun))
		chromosphericActivity: record.st_log_rhk, // Stellar Chromospheric Activity index (log R'HK, measures how magnetically violent the star is. High values mean massive sunspots, violent solar flares, and Coronal Mass Ejections)

		// Kinematics and rotation
		radialVelocity: record.st_vsin, // Radial Velocity relative to barycenter (km/s, for circumbinary systems)
		period: record.st_rotp, // Stellar Rotation Period (Days)

		// Circumbinary data
		mass: record.st_mass, // Stellar Mass (Solar masses, for circumbinary systems)
	}

	// Validate records and flag issues
	const missingNodeFields = Object.entries(starNode).filter(
		([key, value]) => value === null || value === undefined,
	)
	if (missingNodeFields.length)
		console.warn(
			`Star node ${starNode.id} is missing fields: ${missingNodeFields.map(([key]) => key).join(', ')}`,
			record,
		)

	return starNode
}
