import { AstroJSON } from '../../../../types/AstroJSON'
import { calculateDirectionalVectorInRenderspace } from './calculateDistanceInRenderspace'

// Basic memory of already processed neighbours to reduce time complexity to O(n^2) instead of O(n^3)
let processedNeighbours: Set<string> = new Set()

// Neighbours are stored as edges to nodes so are efficiently retrieved once a system comes into focus
export const getNeighbours = (
	s1: AstroJSON.Neo4J.Node.System,
	targets: AstroJSON.Neo4J.Node.System[],
): AstroJSON.Neo4J.Edge.Neighbour[] => {
	let neighbours: AstroJSON.Neo4J.Edge.Neighbour[] = []

	// Expand function for better control to reduce time complexity down from O(n^3) (w/ lightweight loop wrapper reducing construction costs)
	for (let i = 0; i < targets.length; i++) {
		const id = `${s1.id}|${targets[i].id}`
		if (s1.id === targets[i].id)
			continue // Exclude self
		// Check if this neighbour pair has already been processed to avoid duplicates
		else if (processedNeighbours.has(id) || processedNeighbours.has(id))
			continue
		else {
			// Compute distance and direction from source to target system in renderspace
			const { distance, direction } =
				calculateDirectionalVectorInRenderspace(
					s1.coords,
					targets[i].coords,
				)

			// Discard distant neighbours and invalid distances
			if (distance > 15 || !distance || !direction) continue

			// Store nearby neighbour as an edge
			neighbours.push({
				id,
				source: s1.id,
				target: targets[i].id,
				type: 'nearby',
				distance,
				direction,
			})
			processedNeighbours.add(id) // Mark this neighbour pair as processed to avoid duplicates
		}
	}
	return neighbours
}
