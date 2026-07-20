import { AstroJSON } from '../../../../types/AstroJSON'
import { NASA } from '../../../../types/NASA'
import { convertEquatorialToCartesian } from '../astronometrics/convertEquatorialToCartesian'
import { getAbsoluteMagnitude } from '../astronometrics/getAbsoluteMagnitude'
import { guaranteePositionalInfo } from '../astronometrics/guaranteePositionalInfo'
import {
	IMPUTED_COORD,
	IMPUTED_STAR_APPARENT_MAGNITUDE,
	IMPUTED_STAR_K_MAGNITUDE,
	IMPUTED_STAR_W1_MAGNITUDE,
	IMPUTED_STAR_W4_MAGNITUDE,
} from '../constants/IMPUTED_VALUES'
import { isInvalidAbsoluteMagnitude } from '../test/tests'

// Creates an AstroJSON schema node for a system from a NASA Minified Exoplanet Archive record
export const systemFromNasaExo = (
	record: NASA.MinifiedExoplanetArchiveSystemRecord,
): AstroJSON.Neo4J.Node.System | null => {
	// Guarantee fields are filled
	const sy_vmag = record.sy_vmag
		? Number(record.sy_vmag)
		: IMPUTED_STAR_APPARENT_MAGNITUDE
	const sy_kmag = record.sy_kmag
		? Number(record.sy_kmag)
		: IMPUTED_STAR_K_MAGNITUDE
	const sy_w1mag = record.sy_w1mag
		? Number(record.sy_w1mag)
		: IMPUTED_STAR_W1_MAGNITUDE
	const sy_w4mag = record.sy_w4mag
		? Number(record.sy_w4mag)
		: IMPUTED_STAR_W4_MAGNITUDE

	// Guarantee positional fields are filled absolutely as best as possible
	const { ra, dec, sy_dist } = guaranteePositionalInfo(record)

	// Parse the record and create a system node
	const systemNode: AstroJSON.Neo4J.Node.System = {
		id: record.sy_name,
		type: 'system',
		name: record.sy_name, // Standardized host system name
		coords: convertEquatorialToCartesian(sy_dist, ra, dec),
		// Photometry
		brightness: getAbsoluteMagnitude(sy_vmag, sy_dist), // Calculate absolute brightness from apparent brightness since this was measured from Earth
		color: sy_vmag - sy_kmag, // Color as a standardized decimal value. High values mean a red/cool system; low/negative values mean a blue/hot system
		hasDebrisDisk: sy_w1mag - sy_w4mag > 0.25, // Does this system have a circumstellar disk of heated dust? (deep infrared w4mag)
	}

	// Validate data
	if (isInvalidAbsoluteMagnitude(systemNode))
		console.warn(
			`System node ${systemNode.id} has invalid absolute magnitude: ${systemNode.brightness}`,
		)

	return systemNode
}
