import { NASA } from '../../../../../types/NASA'

const URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'

export const MINIFIED_STAR_FIELDS = [
	'hostname',
	'hostid',
	'sy_name',
	'hd_name',
	'hip_name',
	'tic_id',
	'gaia_dr3_id',
	'st_spectype',
	'st_teff',
	'st_rad',
	'st_mass',
	'st_lum',
	'st_dens',
	'st_logg',
	'st_age',
	'st_met',
	'st_metratio',
	'st_radv',
	'st_rotp',
	'st_vsin',
	'st_log_rhk',
] as const

// Get star data from NASA's Exoplanet Archive by its standardized host star name.
export const getStar = async (hostname: string) => {
	const selectedColumns = MINIFIED_STAR_FIELDS.join(', ')
	// Use distinct to prevent returning n-duplicate rows for an n-planet system
	const query = encodeURIComponent(
		`select distinct ${selectedColumns} from pscomppars where hostname = '${hostname.replace(/'/g, "''")}'`,
	)
	const response = await fetch(`${URL}?query=${query}&format=json`)

	if (!response.ok) {
		throw new Error(
			`Failed to fetch star ${hostname}: ${response.status} ${response.statusText}`,
		)
	}

	const minifiedData: NASA.MinifiedExoplanetArchiveStarRecord[] =
		await response.json()

	return minifiedData
}
