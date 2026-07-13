import fs from 'fs'
import { NASA } from '../../../../../types/NASA'

const URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'
export const MINIFIED_FIELDS = [
	'pl_name',
	'pl_letter',
	'disc_pubdate',
	'disc_method',
	'disc_refname',
	'dkin_flag',
	'ra',
	'dec',
	'glon',
	'glat',
	'pl_orbper',
	'pl_orblper',
	'pl_orbsmax',
	'pl_orbincl',
	'pl_orbtper',
	'pl_orbeccen',
	'cb_flag',
	'sy_pm',
	'sy_pmra',
	'sy_pmdec',
	'sy_plx',
	'sy_dist',
	'pl_eqt',
	'pl_occdep',
	'pl_insol',
	'pl_dens',
	'pl_radj',
	'pl_rade',
	'pl_trueobliq',
	'pl_bmassj',
	'pl_bmasse',
	'pl_ntranspec',
	'sy_gaiamag',
	'sy_tmag',
	'sy_w1mag',
	'sy_w4mag',
	'hostname',
	'sy_name',
	'pl_ratdor',
	'pl_imppar',
] as const

// Get one exoplanet from NASA's Exoplanet Archive by its standardized planet name.
export const getExoPlanet = async (planetId: string) => {
	// Query only the minified field set from NASA's Exoplanet Archive.
	const selectedColumns = MINIFIED_FIELDS.join(', ')
	const query = encodeURIComponent(
		`select ${selectedColumns} from pscomppars where pl_name = '${planetId.replace(/'/g, "''")}'`,
	)
	const response = await fetch(`${URL}?query=${query}&format=json`)

	if (!response.ok) {
		throw new Error(
			`Failed to fetch exoplanet ${planetId}: ${response.status} ${response.statusText}`,
		)
	}

	const minifiedData: NASA.MinifiedExoplanetArchiveRecord[] =
		await response.json()

	return minifiedData
}
