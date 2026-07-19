// Types for ESA data exports
export namespace ESA {
	export namespace Gaia {
		type HyperMinifiedStarRecord = {
			designation: string // name
			ra: number // deg
			dec: number // deg
			parallax: number // distance in milliarcseconds
			teff_gspphot: kelvin // effective temperature in Kelvin
			radius_gspphot: number // radius in solar radii
			lum_flame: number // luminosity in solar luminosities
		}
	}
}
