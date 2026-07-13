import { AstroJSON } from '../../../../types/AstroJSON'

// Calculates the crow flight distance between two points in 3d cartesian render space
export const calculateDirectionalVectorInRenderspace = (
	coord1: {
		x: number
		y: number
		z: number
	},
	coord2: {
		x: number
		y: number
		z: number
	},
): {
	distance: number
	direction: { x: number; y: number; z: number }
} => {
	// Calculate separation along each axis
	const dx = coord2.x - coord1.x
	const dy = coord2.y - coord1.y
	const dz = coord2.z - coord1.z

	// Calculate straight-line distance between the two coords
	const distance = Math.hypot(dx, dy, dz)

	// Calculate a directional vector from source to target
	const direction = {
		x: dx / distance, // Use distance to normalise each axis value to be a direction
		y: dy / distance,
		z: dz / distance,
	}

	// Note: Returns (original units, e.g., pc)
	return { distance, direction }
}
