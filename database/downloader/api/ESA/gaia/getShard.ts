import { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'

const GAIA_SOURCE_URL = 'https://cdn.gea.esac.esa.int/Gaia/gdr3/gaia_source/'

const GAIA_PHYSICAL_URL =
	'https://cdn.gea.esac.esa.int/Gaia/gdr3/Astrophysical_parameters/astrophysical_parameters/'

// Get data by shard from ESA Gaia
export const getShard = async (
	shard: string, // e.g., '000000-003111'
): Promise<{
	sourceStream: Readable
	physicalStream: Readable
}> => {
	// Construct requests
	const sourceQuery = `GaiaSource_${shard}.csv.gz`
	const physicalQuery = `AstrophysicalParameters_${shard}.csv.gz`

	// Send requests
	const [sourceResponse, physicalResponse] = await Promise.all([
		fetch(GAIA_SOURCE_URL + sourceQuery),
		fetch(GAIA_PHYSICAL_URL + physicalQuery),
	])

	if (!sourceResponse.ok || !physicalResponse.ok)
		throw new Error(
			`Failed to fetch Gaia source shard ${shard}: ` +
				`${sourceResponse.status} ${sourceResponse.statusText}`,
		)

	// Decompress & create streams from fetch responses
	const sourceStream = Readable.fromWeb(sourceResponse.body as never).pipe(
		createGunzip(),
	)
	const physicalStream = Readable.fromWeb(
		physicalResponse.body as never,
	).pipe(createGunzip())

	return {
		sourceStream,
		physicalStream,
	}
}
