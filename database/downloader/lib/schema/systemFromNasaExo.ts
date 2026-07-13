import { AstroJSON } from '../../../../types/AstroJSON'
import { NASA } from '../../../../types/NASA'
import { convertEquatorialToCartesian } from '../astronometrics/convertEquatorialToCartesian'

// Creates an AstroJSON schema node for a system from a NASA Minified Exoplanet Archive record
export const systemFromNasaExo = (
	record: NASA.MinifiedExoplanetArchiveSystemRecord,
): AstroJSON.Neo4J.Node.System | null => {
	// Parse the record and create a system node
	const systemNode: AstroJSON.Neo4J.Node.System = {
		id: record.sy_name,
		type: 'system',
		name: record.sy_name, // Standardized host system name
		coords: convertEquatorialToCartesian(
			record.sy_dist,
			record.ra,
			record.dec,
		),

		// Photometry
		brightness: record.sy_vmag - 5 * Math.log10(record.sy_dist) + 5, // Absolute star brightness (from apparent Johnson V-band), will be used to work out apparent brightness (M = m - 5 \log_{10}(d) + 5)
		color: record.sy_vmag - record.sy_kmag, // Color as a standardized decimal value. High values mean a red/cool system; low/negative values mean a blue/hot system
		hasDebrisDisk: record.sy_w1mag - record.sy_w4mag > 0.25, // Does this system have a circumstellar disk of heated dust? (deep infrared w4mag)
	}

	// Validate records and flag issues
	const missingNodeFields = Object.entries(systemNode).filter(
		([key, value]) => value === null || value === undefined,
	)
	if (missingNodeFields.length)
		console.warn(
			`System node ${systemNode.id} is missing fields: ${missingNodeFields.map(([key]) => key).join(', ')}`,
			record,
		)

	return systemNode
}
