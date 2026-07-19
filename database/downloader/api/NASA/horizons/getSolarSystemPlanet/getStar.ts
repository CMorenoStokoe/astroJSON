import { SOLAR_STAR_RECORDS } from './solarSystemRecords'

// Get star data from the Horizons-backed solar system dataset by its standardized host star name.
export const getStar = async (hostname: string) =>
	SOLAR_STAR_RECORDS.filter((record) => record.hostname === hostname)
