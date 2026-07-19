pl_name: string
hostname: string
sy_dist: number // Distance from Earth (parsecs)

// 3. Core Physics (Composition)
pl_masse: number | null // Planet Mass (Earth masses)
pl_rade: number | null // Planet Radius (Earth radii)
pl_dens: number | null // Planet Density (g/cm³)

// 4. Orbital Mechanics (The Engine)
pl_orbper: number | null // Orbital Period (days) - drives velocity
pl_orbsmax: number | null // Semi-major Axis (AU) - drives distance
pl_orbeccen: number | null // Eccentricity - drives orbital shape
pl_orbincl: number | null // Inclination (degrees) - drives orbital tilt

// 5. Energy & Habitability (The Lore/Exobiology)
pl_eqt: number | null // Equilibrium Temperature (K)
pl_insol: number | null // Insolation Flux (Earth = 1.0)

// 6. Host Star Parameters
st_mass: number | null // Stellar Mass (Solar masses)
st_rad: number | null // Stellar Radius (Solar radii)
st_teff: number | null // Stellar Effective Temperature (K)


	// Body data
		data?: {
			mass?: number // Mass of the body
			density?: number // Density of the body (& therefore composition, gravity, etc.)
			temperature?: number // Surface temperature of the body
			photogrammetry?: string // Any photos of the body
		}