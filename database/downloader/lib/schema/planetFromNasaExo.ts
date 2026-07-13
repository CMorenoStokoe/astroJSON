import { AstroJSON } from '../../../../types/AstroJSON'
import { NASA } from '../../../../types/NASA'
import { classifyPlanetType } from '../planetology/classifyPlanetType'

// Creates an AstroJSON schema node for a planet from a NASA Minified Exoplanet Archive record
export const planetFromNasaExo = (
	record: NASA.MinifiedExoplanetArchiveRecord,
): {
	planetNode: AstroJSON.Neo4J.Node.Planet
	orbitEdge: AstroJSON.Neo4J.Edge.Orbit
} | null => {
	// Parse the record and create a planet node
	const planetNode: AstroJSON.Neo4J.Node.Planet = {
		id: record.pl_name,
		type: 'planet',
		classification: classifyPlanetType(record.pl_rade, record.pl_dens),
		name: record.pl_name,
		temperature: record.pl_eqt,
		density: record.pl_dens,
		radius: record.pl_rade,
		axialTilt: record.pl_trueobliq,
		hasAtmosphere: (record.pl_ntranspec ?? 0) >= 1,
		discoveryDate: record.disc_pubdate,
		discoveryReference: record.disc_refname,
	}

	// Parse the record and create an orbit edge
	const orbitEdge: AstroJSON.Neo4J.Edge.Orbit = {
		id: `${record.pl_name}|${record.hostname}`,
		source: record.pl_name,
		target: record.hostname,
		type: 'orbits',
		distance: record.pl_orbsmax, // Take path.a as the average approximate distance between the two bodies (AU)
		a: record.pl_orbsmax, // Semi-major axis (defines size)
		e: record.pl_orbeccen, // Eccentricity (defines shape, ratio of "oval-ness" from 0 to 1)
		i: record.pl_orbincl, // Inclination (defines tilt)
		// O: record., // Longitude of ascending node (not provided in the record)
		w: record.pl_orblper, // Argument of periapsis (Degrees, where the an eccentric orbit is closest to the star)
		M: record.pl_orbtper, // Mean anomaly at epoch (defines current phase)
		P: record.pl_orbper, // Orbital period (defines speed)
		isCircumbinary: record.cb_flag > 0 ? true : false, // Is this a circumbinary orbit? (i.e., orbiting a binary star system)
	}

	// Validate records and flag issues
	const missingNodeFields = Object.entries(planetNode).filter(
		([key, value]) => value === null || value === undefined,
	)
	const missingEdgeFields = Object.entries(orbitEdge).filter(
		([key, value]) => value === null || value === undefined,
	)
	if (missingNodeFields.length)
		console.warn(
			`Planet node ${planetNode.id} is missing fields: ${missingNodeFields.map(([key]) => key).join(', ')}`,
			record,
		)
	if (missingEdgeFields.length)
		console.warn(
			`Orbit edge for planet ${orbitEdge.source} is missing fields: ${missingEdgeFields.map(([key]) => key).join(', ')}`,
			record,
		)

	if (missingNodeFields.length || missingEdgeFields.length) {
		console.warn(`Skipping planet ${planetNode.id} due to missing fields.`)
		return null
	} else return { planetNode, orbitEdge }
}
