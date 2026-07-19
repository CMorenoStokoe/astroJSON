import { ESA } from '../../../../../types/ESA'

// https://gea.esac.esa.int/tap-server/tap/sync?REQUEST=doQuery&LANG=ADQL&FORMAT=csv
const URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'

export const HYPER_MINIFIED_STAR_FIELDS: (keyof ESA.Gaia.HyperMinifiedStarRecord)[] =
	[
		'designation',
		'ra',
		'dec',
		'parallax',
		'teff_gspphot',
		'radius_gspphot',
		'lum_flame',
	] as const

const GAIA_STAR_BATCH_SIZE = 1000

// Get star data from the ESA Gaia via TAP service
export const getStar = async (batchNo: number) => {
	const selectedColumns = HYPER_MINIFIED_STAR_FIELDS.join(', ')
	// Construct TAP query
	const query = encodeURIComponent(
		`SELECT TOP ${GAIA_STAR_BATCH_SIZE}
			g.source_id,
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
			AND g.parallax > 0
			AND ap.teff_gspphot IS NOT NULL
			AND ap.radius_gspphot IS NOT NULL
			AND ap.lum_flame IS NOT NULL
		ORDER BY g.source_id`,
	)
	const response = await fetch(`${URL}?query=${query}&format=json`)

	if (!response.ok) {
		throw new Error(
			`Failed to fetch star ${hostname}: ${response.status} ${response.statusText}`,
		)
	}

	const minifiedData: ESA.Gaia.HyperMinifiedStarRecord[] =
		await response.json()

	return minifiedData
}
