import { AstroJSON } from '../../../../types/AstroJSON'
import { calculateDistanceInRenderspace } from './calculateDistanceInRenderspace'

// Creates edges linking visible systems at an efficient neighbourhood-level resolution
export const getVisibleNeighbourhoods = (
	neighbourhoods: AstroJSON.Neo4J.Node.Neighbourhood[],
	systems: AstroJSON.Neo4J.Node.System[],
	neighbourhoodMembershipEdges: AstroJSON.Neo4J.Edge.Child[],
): AstroJSON.Neo4J.Edge.Sees[] => {
	const edges: AstroJSON.Neo4J.Edge.Sees[] = []

	// Prepare lookup to ensure that only systems outside the same neighbourhood are considered for visibility
	const neighbourhoodLookup = new Map(
		neighbourhoodMembershipEdges.map((edge) => [edge.source, edge.target]),
	)

	// Iterate through each combination of star from each neighbourhood to approximate visibility
	for (let s = 0; s < systems.length; s++) {
		for (let n = 0; n < neighbourhoods.length; n++) {
			// Ensure is not in the same neighbourhood (i.e., only consider systems outside the neighbourhood)
			if (neighbourhoodLookup.get(systems[s].id) === neighbourhoods[n].id)
				continue

			// Calculate distance from neighbourhood centre to star
			const { distance, direction } = calculateDistanceInRenderspace(
				neighbourhoods[n].centrum,
				systems[s].coords,
			)

			// Calculate apparent brightness given distance
			const apparentBrightness =
				systems[s].brightness + 5 * Math.log10(distance) - 5

			// Record an edge if the star is visible to the neighbourhood (apparent brightness < 6.5)
			if (apparentBrightness <= 6.5)
				edges.push({
					id: `${neighbourhoods[n].id}|${systems[s].id}`,
					source: neighbourhoods[n].id,
					target: systems[s].id,
					type: 'sees',
					distance,
					direction,
					apparentBrightness,
				})
		}
	}
	return edges
}
