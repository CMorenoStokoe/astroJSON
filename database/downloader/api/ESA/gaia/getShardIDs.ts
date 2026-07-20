// Gets shard ids for Gaia datasets
const GAIA_BUCKET_LIST_URL = 'https://gaia.eu-1.cdn77-storage.com/'

const GAIA_SOURCE_PREFIX = 'Gaia/gdr3/gaia_source/'

const GAIA_PHYSICAL_PREFIX =
	'Gaia/gdr3/Astrophysical_parameters/astrophysical_parameters/'

const getShardIDsByPrefix = async (
	prefix: string,
	filenameRegex: RegExp,
): Promise<Set<string>> => {
	const shardIDs = new Set<string>()
	let marker: string | null = null

	while (true) {
		const query = new URLSearchParams({
			prefix,
			delimiter: '/',
		})

		if (marker) query.set('marker', marker)

		const response = await fetch(
			`${GAIA_BUCKET_LIST_URL}?${query.toString()}`,
		)

		if (!response.ok)
			throw new Error(
				`Failed to fetch Gaia shard list for ${prefix}: ` +
					`${response.status} ${response.statusText}`,
			)

		const xml = await response.text()
		const matches = xml.matchAll(filenameRegex)

		for (const match of matches) shardIDs.add(match[1])

		const isTruncatedMatch = xml.match(
			/<IsTruncated>(true|false)<\/IsTruncated>/,
		)
		const nextMarkerMatch = xml.match(/<NextMarker>([^<]+)<\/NextMarker>/)
		const isTruncated = isTruncatedMatch?.[1] === 'true'

		if (!isTruncated || !nextMarkerMatch?.[1]) break

		marker = nextMarkerMatch[1]
	}

	return shardIDs
}

// Get Gaia shard identifiers that exist in both required datasets
export const getGaiaShardIDs = async (): Promise<string[]> => {
	// Fetch shard IDs from paginated XML listings for both datasets
	const [sourceShards, physicalShards] = await Promise.all([
		getShardIDsByPrefix(
			GAIA_SOURCE_PREFIX,
			/GaiaSource_(\d{6}-\d{6})\.csv\.gz/g,
		),
		getShardIDsByPrefix(
			GAIA_PHYSICAL_PREFIX,
			/AstrophysicalParameters_(\d{6}-\d{6})\.csv\.gz/g,
		),
	])

	// Only process shard ranges available in both datasets
	return [...sourceShards].filter((shard) => physicalShards.has(shard))
}
