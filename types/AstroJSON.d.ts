import { NASA } from './NASA'

// Common unit types for intellisense convenience
type Gpc = number // Gigaparsec
type Mpc = number // Megaparsec
type kpc = number // Kiloparsec
type pc = number // Parsec
type AU = number // Astronomical Units
type Days = number
type Degrees = number
type Year = ReturnType<Date['toISOString']> // ISO 8601 Year string (YYYY-MM-DDTHH:mm:ss.sssZ)
type Kelvin = number
type gcm3 = number // grams per cubic centimeter (g/cm³)
type Re = number // Earth radii
type Rj = number // Jupiter radii
type Rs = number // Solar radii
type Ms = number // Solar masses
type LogSolarLuminosities = number // Base-10 Logarithm of Solar Luminosities (a value of 0 is 1 Sun, 1 is 10 Suns etc.)

// Graph database types
export namespace AstroJSON {
	// Rendering
	namespace Renderer {
		type Quaternion = [number, number, number, number] // [w, x, y, z] where w is the scalar part and (x, y, z) is the vector part
		type NestedReferenceFrame = {
			galacticScale: Mpc // Galaxy coord in universe
			systemScale: pc // System coord in galaxy
			bodyScale: AU // Body coord in system
		}
		type RelativePositionVector = [number, number, number, number] // [x, y, z, distance]
	}

	// Data schema
	namespace Schema {
		type Planet = {
			// Identity
			name: string // Standardized planet name (e.g., 'Kepler-186 f')

			// Planetary details
			classification:
				| 'Mercurian' // Iron-dominated core
				| 'Terrestrial' // Silicate/Rocky (Earth-sized)
				| 'Super-Earth' // Silicate/Rocky (Massive)
				| 'Ocean World' // Volatile/Water-rich (Hycean candidates)
				| 'Mega-Earth' // Anomalously dense massive rock (Chthonian stripped core)
				| 'Mini-Neptune' // Thick gas envelope, small radius
				| 'Neptunian' // Ice Giant analogue
				| 'Jovian' // Standard Gas Giant
				| 'Super-Puff' // Anomalously low-density gas planet
				| 'Super-Jovian' // High-density giant / Brown Dwarf border
				| 'Unknown' // Insufficient data
			temperature: Kelvin // Equilibrium Temperature (Kelvin)
			density: gcm3 // Planet Density useful for identifying planet type (g/cm³)
			radius: Re // Planet Radius (Earth Radii, converted from Jupiter radii where provided for simplicity)
			axialTilt: Degrees // True Obliquity (Axial tilt, Degrees)
			hasAtmosphere: boolean // Number of transmission spectra available (>0 implies there is atmospheric composition data)

			// Discovery metadata (just for displaying interesting facts)
			discoveryDate: string // Discovery publication date (YYYY-MM)
			discoveryReference: string // HTML string of the discovery reference paper
		}
		type Star = {
			name: string // Standardized host star name

			// Appearance
			temperature: number // Effective Temperature (Kelvin, for color)
			radius: Rs // Stellar Radius (Solar radii)
			mass: Ms // Stellar Mass (Solar masses, for circumbinary systems)
			luminosity: LogSolarLuminosities // Stellar Luminosity (log(L/L_sun))
			chromosphericActivity: number // Stellar Chromospheric Activity index (log R'HK, measures how magnetically violent the star is. High values mean massive sunspots, violent solar flares, and Coronal Mass Ejections)

			// Kinematics and rotation
			radialVelocity: number // Radial Velocity relative to barycenter (km/s, for circumbinary systems)
			period: number // Stellar Rotation Period (Days)
		}
		type System = {
			// Identity
			name: string // System Name (unique key)
			coords: { x: pc; y: pc; z: pc } // Cartesian 3d coordinates (largely for data handling convenience)

			// Photometry
			brightness: number // Absolute star brightness (Gaia Magnitude /vmag fallback), will be used to work out apparent brightness (M = m - 5 \log_{10}(d) + 5)
			color: number // Color as a standardized decimal value. High values mean a red/cool system; low/negative values mean a blue/hot system
			hasDebrisDisk: boolean // Does this system have a circumstellar disk of heated dust? (deep infrared w4mag)
		}
		type Neighbourhood = {
			id: string // Unique ID for the neighbourhood (e.g., 'trappist-1-neighbourhood')
			coords: { x: pc; y: pc; z: pc } // Approximate central cartesian 3d coords for this neighbourhood (often anchor system coords, used for rendering)
			radius: pc // Approximate radius of the neighbourhood (width in skybox)

			// Aggregate properties of all included stars (used for rendering)
			nSystems: number // Count of systems in this neighbourhood (density)
			brightness: number // Aggregate absolute star brightness
			color: number // Aggregate color
			debrisDiskStrength: number // Proportion 0-1 of stars with circumstellar disks indicating opacity of rendered circumstellar dust
		}
		type Galaxy = {
			// Identity
			name: string // Standardized galaxy name (e.g., 'Milky Way')
		}
	}

	// Neo4j Database
	namespace Neo4J {
		// Node types
		namespace Node {
			type AnyBody = Planet | Star
			type Planet = {
				id: string
				type: 'planet'
			} & Schema.Planet
			type Star = {
				id: string
				type: 'star'
			} & Schema.Star
			type System = {
				id: string
				type: 'system'
			} & Schema.System
			type Neighbourhood = {
				id: string
				type: 'neighbourhood'
			} & Schema.Neighbourhood
			type Galaxy = {
				id: string
				type: 'galaxy'
			} & Schema.Galaxy
		}
		type Node =
			| Node.Planet
			| Node.Star
			| Node.System
			| Node.Neighbourhood
			| Node.Galaxy

		// Edge types
		namespace Edge {
			// Types of edges
			type Child = {
				id: string // 'bodyId|systemId' or 'systemId|neighbourhoodId' | 'neighbourhoodId|galaxyId'
				source: string
				target: string
				type: 'in'
				position: [AU, AU, AU] | [pc, pc, pc] | [Mpc, Mpc, Mpc] // Relative position vector of the child body in the parent body's frame of reference
				// hierarchy: Galaxy --> Neighbourhoods --> System --> Bodies (e.g., star, planet)
				details?: Record<string, any>
			}
			type Nearby = {
				id: string // 'sysId|sysId'
				source: string
				target: string
				type: 'nearby'
			}
			type Orbit = {
				id: string // 'bodyId|bodyId'
				source: string
				target: string
				type: 'orbits'
				distance: AU // Take path.a as the average approximate distance between the two bodies (AU)
				// Keplerian orbital elements (https://en.wikipedia.org/wiki/Orbital_elements)
				a: AU // Semi-major axis (defines size)
				e: number // Eccentricity (defines shape, ratio of "oval-ness" from 0 to 1)
				i: Degrees // Inclination (defines tilt)
				w: Degrees // Argument of periapsis (Degrees, where the an eccentric orbit is closest to the star)
				M: number // Mean anomaly at epoch (defines current phase)
				P: Days // Orbital period (defines speed)
				// O: number // Longitude of ascending node (not in database)
				isCircumbinary: boolean // Is this a circumbinary orbit? (i.e., orbiting a binary star system)
				details?: Record<string, any>
			}
		}
	}
}
