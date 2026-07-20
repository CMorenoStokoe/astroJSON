import { AstroJSON } from '../../../../types/AstroJSON'
import { VISIBILITY_APPARENT_BRIGHTNESS_THRESHOLD } from '../../config/settings'
import { calculateDistanceInRenderspace } from './calculateDistanceInRenderspace'
import { getApparentBrightness } from '../astronometrics/getApparentBrightness'
import {
	isInvalidApparentMagnitude,
	isInvalidNormalisedDirectionalVector,
} from '../test/tests'

// Creates edges linking visible systems at an efficient neighbourhood-level resolution
export const getVisibleNeighbourhoods = (
	neighbourhoods: AstroJSON.Neo4J.Node.Neighbourhood[],
	systems: AstroJSON.Neo4J.Node.System[],
	neighbourhoodMembershipEdges: AstroJSON.Neo4J.Edge.Child[],
): AstroJSON.Neo4J.Edge.Sees[] => {
	const edges: AstroJSON.Neo4J.Edge.Sees[] = []

	// Prepare lookup to ensure that only systems outside the same neighbourhood are considered for visibility
	const neighbourhoodLookup = new Map()
	for (const edge of neighbourhoodMembershipEdges)
		neighbourhoodLookup.set(edge.source, edge.target)

	// Iterate through each combination of star from each neighbourhood to approximate visibility
	for (let s = 0; s < systems.length; s++) {
		for (let n = 0; n < neighbourhoods.length; n++) {
			const neighbourhood = neighbourhoods[n]
			// Calculate distance from neighbourhood centre to star
			const { distance, direction } = calculateDistanceInRenderspace(
				neighbourhoods[n].centrum,
				systems[s].coords,
			)

			// Calculate apparent brightness given distance
			const apparentBrightness = getApparentBrightness(
				systems[s].brightness,
				distance,
			)
			const isVisible =
				apparentBrightness <= VISIBILITY_APPARENT_BRIGHTNESS_THRESHOLD

			// Identify neighbours for automatic inclusion
			const isInNeighbourhood =
				neighbourhoodLookup.get(systems[s].id) === neighbourhood.id
			const isAnchorSystemForThisNeighbourhood =
				isInNeighbourhood &&
				neighbourhood.id === `${systems[s].id}-neighbourhood`

			// Record an edge if the star is visible to the neighbourhood (below apparent brightness threshold)
			const edge: AstroJSON.Neo4J.Edge.Sees = {
				id: `${neighbourhood.id}|${systems[s].id}`,
				source: neighbourhoods[n].id,
				target: systems[s].id,
				type: 'sees',
				distance,
				direction,
				apparentBrightness,
			}

			// Return desired edges
			if (
				!isAnchorSystemForThisNeighbourhood &&
				(isInNeighbourhood || isVisible)
			)
				edges.push(edge)

			/*
			// Validate data
			if (isInvalidNormalisedDirectionalVector(edge)) {
				console.warn(
					`Direction vector for edge ${edge.id} is invalid. Direction: [${edge.direction}].`,
				)
				continue
			}
			if (isInvalidApparentMagnitude(edge))
				console.warn(
					`System node ${edge.id} has invalid apparent magnitude: ${edge.apparentBrightness}`,
				)*/
		}
	}

	return edges
}
