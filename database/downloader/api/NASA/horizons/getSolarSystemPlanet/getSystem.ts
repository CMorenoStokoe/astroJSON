import { SOLAR_SYSTEM_RECORDS } from './solarSystemRecords'

// Get system data from the Horizons-backed solar system dataset by its standardized system name.
export const getSystem = async (systemName: string) =>
	SOLAR_SYSTEM_RECORDS.filter((record) => record.sy_name === systemName)
