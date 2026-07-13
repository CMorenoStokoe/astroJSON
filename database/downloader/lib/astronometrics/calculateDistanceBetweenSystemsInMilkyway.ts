import { NASA } from '../../../../types/NASA'

// Calculate straight line distance from one Milky Way system to another (using galactic coords)
export const calculateDistanceBetweenSystemsInMilkyway = (
	s1: NASA.MinifiedExoplanetArchiveSystemRecord, // Source system
	s2: NASA.MinifiedExoplanetArchiveSystemRecord, // Target system
): {
	distance: number
	direction: { x: number; y: number; z: number }
} => {
	// Convert units from degrees to radians for JS Math
	const s1l = (s1.glon * Math.PI) / 180 // Longitude
	const s1b = (s1.glat * Math.PI) / 180 // Latitude
	const s1r = s1.sy_dist // Distance

	const s2l = (s2.glon * Math.PI) / 180
	const s2b = (s2.glat * Math.PI) / 180
	const s2r = s2.sy_dist

	// Derive separation in each of the three dimensions
	const dx =
		s2r * Math.cos(s2b) * Math.cos(s2l) -
		s1r * Math.cos(s1b) * Math.cos(s1l) // Along galactic x
	const dy =
		s2r * Math.cos(s2b) * Math.sin(s2l) -
		s1r * Math.cos(s1b) * Math.sin(s1l) // Along galactic y
	const dz = s2r * Math.sin(s2b) - s1r * Math.sin(s1b) // Above/below galactic plane

	// Calculate straight line distance between systems
	const distance = Math.hypot(dx, dy, dz) // Parsecs (pc)

	// Derive directional vector to represent the direction of target system relative to source
	const direction = {
		x: dx / distance,
		y: dy / distance,
		z: dz / distance, // right-handed
	}

	return { distance, direction }
}
