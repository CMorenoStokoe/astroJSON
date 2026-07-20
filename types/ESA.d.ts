// Types for ESA data exports
export namespace ESA {
	export namespace Gaia {
		// Star record type minimised to save space and time
		type HyperMinifiedStarRecord = {
			source_id: number // unique Gaia source id
			ra: number // deg
			dec: number // deg
			parallax: number // distance in milliarcseconds
			teff_gspphot?: kelvin // effective temperature in Kelvin
			radius_gspphot?: number // radius in solar radii
			lum_flame?: number // luminosity in solar luminosities
		}
		// Csv format output from API#
		type HyperMinifiedStarRecordCSV = string // CSV formatted string of HyperMinifiedStarRecord
	}
}
