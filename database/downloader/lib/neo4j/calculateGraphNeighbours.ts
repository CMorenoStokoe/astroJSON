import { AstroJSON } from '../../../../types/AstroJSON'
import { aggregateLightEmissions } from '../astronometrics/aggregateLightEmissions'
import { calculateNeighbourhoodBbox } from '../renderer/calculateNeighbourhoodBbox'

const MAX_ITERATIONS = 10 // Maximum number of iterations for label propagation

// Use a graph label propagation approach to identify neighbourhoods of clustered stars for rendering purposes
export const calculateGraphNeighbours = (
	nodes: AstroJSON.Neo4J.Node.System[],
	edges: { source: string; target: string; distance: number }[],
): {
	neighbourhoodNodes: AstroJSON.Neo4J.Node.Neighbourhood[]
	neighbourhoodMembershipEdges: AstroJSON.Neo4J.Edge.Child[]
} => {
	// Define maps and lookups for population in one-sweep to reduce time complexity
	const sysMap = new Map<string, Set<string>>()
	const sysLookup = new Map<string, AstroJSON.Neo4J.Node.System>()
	const labels = new Map<string, string>() // [star, community]

	// Iterate over nodes once to initialize the system map and lookups
	for (let i = 0; i < nodes.length; i++) {
		// Combine iterations for efficiency
		sysMap.set(nodes[i].id, new Set<string>()) // Initialize an empty set for each star to store its neighbours
		sysLookup.set(nodes[i].id, nodes[i]) // Store the star node for quick access
		labels.set(nodes[i].id, nodes[i].id) // Each star starts as its own community (initialise labels)
	}

	// Iterate over edges once to populate neighbours
	for (let i = 0; i < edges.length; i++) {
		if (!sysMap.get(edges[i].source)?.has(edges[i].target))
			sysMap.get(edges[i].source)!.add(edges[i].target)
		if (!sysMap.get(edges[i].target)?.has(edges[i].source))
			sysMap.get(edges[i].target)!.add(edges[i].source)
	}

	// Propagate topology labels
	for (let i = 0; i < MAX_ITERATIONS; i++) {
		let changed = false

		// Shuffle nodes each iteration for natural convergence
		const nodeIds = Array.from(sysMap.keys()).sort(
			() => Math.random() - 0.5,
		)

		for (const nodeId of nodeIds) {
			const neighbours = sysMap.get(nodeId)!
			if (!neighbours.size) continue

			// Count the frequency of labels among topological neighbors
			const labelCounts = new Map<string, number>()
			let maxCount = 0
			let mostFrequentLabel = labels.get(nodeId)!

			// Iterate through each neighbour to count their labels
			for (const adjId of neighbours) {
				const adjLabel = labels.get(adjId)!
				const count = (labelCounts.get(adjLabel) || 0) + 1
				labelCounts.set(adjLabel, count)

				if (count > maxCount) {
					maxCount = count
					mostFrequentLabel = adjLabel
				}
			}

			// Adopt the most popular label among neighbours
			if (labels.get(nodeId) !== mostFrequentLabel) {
				labels.set(nodeId, mostFrequentLabel)
				changed = true
			}
		}

		// Break if no labels migrate as this means the graph structure has stabilised
		if (!changed) break
	}

	// Invert the map to group stars by their assigned community labels
	const invertedLabelMap = labels
		.entries()
		.reduce((acc, [sysId, communityId]) => {
			if (!acc.has(communityId)) acc.set(communityId, [])
			acc.get(communityId)!.push(sysId)
			return acc
		}, new Map<string, string[]>())
		.entries()
		.toArray()

	// Represent neighbourhoods as nodes
	const neighbourhoodMembershipEdges: AstroJSON.Neo4J.Edge.Child[] = []
	const neighbourhoodNodes: AstroJSON.Neo4J.Node.Neighbourhood[] = []
	for (const [anchorSysId, sysIds] of invertedLabelMap) {
		const systems = sysIds.map((id) => sysLookup.get(id)!)
		const id = `${anchorSysId}-neighbourhood`

		// Calculate geometry
		const { centrum, radius, bbox } = calculateNeighbourhoodBbox(systems)

		// Calculate visuals e.g., absolute brightness and color
		const { brightness, color, maxBrightness } =
			aggregateLightEmissions(systems)
		const debrisDiskStrength =
			systems.reduce((acc, sys) => acc + (sys.hasDebrisDisk ? 1 : 0), 0) /
			systems.length

		// Represent neighbourhood as a node
		neighbourhoodNodes.push({
			id,
			type: 'neighbourhood',
			nSystems: systems.length,
			centrum,
			bbox,
			radius,
			brightness,
			maxBrightness,
			color,
			debrisDiskStrength,
		})

		// Represent neighbourhood membership as edges
		for (const system of systems) {
			neighbourhoodMembershipEdges.push({
				id: `${system.id}|${id}`,
				source: system.id,
				target: id,
				type: 'in',
			})
		}
	}

	return { neighbourhoodNodes, neighbourhoodMembershipEdges }
}
