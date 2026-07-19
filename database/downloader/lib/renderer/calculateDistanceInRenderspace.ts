// Calculates the crow flight distance between two points in 3d cartesian render space
export const calculateDistanceInRenderspace = (
	coord1: [number, number, number],
	coord2: [number, number, number],
): {
	distance: number
	direction: [number, number, number]
} => {
	// Calculate separation along each axis
	const dx = coord2[0] - coord1[0]
	const dy = coord2[1] - coord1[1]
	const dz = coord2[2] - coord1[2]

	// Calculate straight-line distance between the two coords
	const distance = Math.hypot(dx, dy, dz)

	// Calculate a directional vector from source to target
	const direction = [
		dx / distance, // x - Use distance to normalise each axis value to be a direction
		dy / distance, // y
		dz / distance, // z
	] as [number, number, number]

	// Note: Returns (original units, e.g., pc)
	return { distance, direction }
}
