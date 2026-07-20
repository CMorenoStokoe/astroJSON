import { ESA } from '$types/ESA'

const URL = 'https://gea.esac.esa.int/tap-server/tap/sync'

export const HYPER_MINIFIED_STAR_FIELDS: (keyof ESA.Gaia.HyperMinifiedStarRecord)[] =
	[
		'source_id',
		'designation',
		'ra',
		'dec',
		'parallax',
		'teff_gspphot',
		'radius_gspphot',
		'lum_flame',
	] as const

const GAIA_STAR_BATCH_SIZE = 10

// Get one batch of star data from ESA Gaia via TAP
export const getStarBatch = async (
	afterSourceId = '0',
): Promise<{
	data: ESA.Gaia.HyperMinifiedStarRecordCSV
	lastSourceId: string
	isEndOfData: boolean
}> => {
	// Construct query
	const query = `
		SELECT TOP ${GAIA_STAR_BATCH_SIZE}
			g.source_id,
			g.designation,
			g.ra,
			g.dec,
			g.parallax,
			ap.teff_gspphot,
			ap.radius_gspphot,
			ap.lum_flame
		FROM gaiadr3.gaia_source AS g
		JOIN gaiadr3.astrophysical_parameters AS ap
			ON g.source_id = ap.source_id
		WHERE g.source_id > ${afterSourceId}
		ORDER BY g.source_id
	`

	// Construct request
	const params = new URLSearchParams({
		REQUEST: 'doQuery',
		LANG: 'ADQL',
		FORMAT: 'csv',
		QUERY: query,
	})

	// Fetch data
	const response = await fetch(`${URL}?${params}`)
	const data = (await response.text()) as ESA.Gaia.HyperMinifiedStarRecordCSV

	if (!response.ok)
		throw new Error(
			`Failed to fetch Gaia star batch after ${afterSourceId}: ` +
				`${response.status} ${response.statusText}\n${data}`,
		)

	// Parse batch metadata
	const lines = data.trim().split(/\r?\n/)
	const rowCount = Math.max(0, lines.length - 1)
	const lastSourceId = lines.at(-1)!.split(',')[0].replaceAll('"', '') // Need last source id to fetch next batch, but if no rows returned, use afterSourceId
	const isEndOfData = rowCount < GAIA_STAR_BATCH_SIZE

	// Log progress
	console.info(
		`[Gaia Batch] ${isEndOfData ? 'Reached end of database' : 'Fetched Gaia star batch'} at #${lastSourceId}`,
	)

	return { data, lastSourceId, isEndOfData }
}
