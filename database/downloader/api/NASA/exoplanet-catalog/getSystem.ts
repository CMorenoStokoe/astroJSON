import { NASA } from '../../../../../types/NASA'

const URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'

export const MINIFIED_SYSTEM_FIELDS = [
	'sy_name',
	'sy_snum',
	'sy_pnum',
	'sy_mnum',
	'cb_flag',
	'ra',
	'dec',
	'glon',
	'glat',
	'sy_dist',
	'sy_plx',
	'sy_pm',
	'sy_pmra',
	'sy_pmdec',
	'sy_gaiamag',
	'sy_tmag',
	'sy_vmag',
	'sy_jmag',
	'sy_kmag',
	'sy_w1mag',
	'sy_w4mag',
] as const

// Get system data from NASA's Exoplanet Archive by its standardized system name.
export const getSystem = async (systemName: string) => {
	const selectedColumns = MINIFIED_SYSTEM_FIELDS.join(', ')
	// Use distinct to prevent returning n-duplicate rows for an n-planet system
	const query = encodeURIComponent(
		`select distinct ${selectedColumns} from pscomppars where sy_name = '${systemName.replace(/'/g, "''")}'`,
	)
	const response = await fetch(`${URL}?query=${query}&format=json`)

	if (!response.ok) {
		throw new Error(
			`Failed to fetch system ${systemName}: ${response.status} ${response.statusText}`,
		)
	}

	const minifiedData: NASA.MinifiedExoplanetArchiveSystemRecord[] =
		await response.json()

	return minifiedData
}
