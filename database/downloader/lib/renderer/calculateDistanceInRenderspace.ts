import { AstroJSON } from '../../../../types/AstroJSON'
import { isInvalidNormalisedDirectionalVector } from '../test/tests'

// Calculates the crow flight distance between two points in 3d cartesian render space
export const calculateDistanceInRenderspace = (
	coord1: [number, number, number],
	coord2: [number, number, number],
): {
	distance: number
	direction: [number, number, number]
} => {
	const EPSILON = 1e-9

	// Calculate separation along each axis
	const dx = coord2[0] - coord1[0]
	const dy = coord2[1] - coord1[1]
	const dz = coord2[2] - coord1[2]

	// Calculate straight-line distance between the two coords
	const rawDistance = Math.hypot(dx, dy, dz)
	const distance = Number.isFinite(rawDistance)
		? Math.max(rawDistance, EPSILON)
		: EPSILON // Smallest distance to avoid division by zero when calculating direction

	// Calculate a directional vector from source to target
	const direction = [
		dx / distance, // x - Use distance to normalise each axis value to be a direction
		dy / distance, // y
		dz / distance, // z
	] as [number, number, number]

	// Validate direction vector
	/*
	if (
		isInvalidNormalisedDirectionalVector({
			direction,
		} as AstroJSON.Neo4J.Edge.Sees)
	)
		console.warn(
			`Direction vector for edge ${coord1}|${coord2} is invalid. Direction: [${direction}].`,
		)*/

	// Note: Returns (original units, e.g., pc)
	return { distance, direction }
}
