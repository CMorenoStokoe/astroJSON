import { AstroJSON } from '../../../../types/AstroJSON'

const MAX_ITERATIONS = 10 // Maximum number of iterations for label propagation

// Use a graph label propagation approach to identify neighbourhoods of clustered stars for rendering purposes
const calculateGraphNeighbours = (
	nodes: AstroJSON.Neo4J.Node.System[],
	edges: AstroJSON.Neo4J.Edge.Nearby[],
): Map<number, number[]> => {
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

	type Neighbourhood = {
		id: string // Unique ID for the neighbourhood (e.g., 'trappist-1-neighbourhood')
		coords: { x: pc; y: pc; z: pc } // Approximate central cartesian 3d coords for this neighbourhood (often anchor system coords, used for rendering)

		// Aggregate properties of all included stars (used for rendering)
		stars: number // Count of stars in this neighbourhood (density)
		radius: pc // Approximate radius of the neighbourhood (width in skybox)
		brightness: number // Aggregate absolute star brightness
		color: number // Aggregate color
		hasDebrisDisk: number // Proportion 0-1 of stars with circumstellar disks indicating opacity of rendered circumstellar dust
	}

	// Invert map to group stars by their assigned community labels
	const neighbourhoods = labels
		.entries()
		.reduce((acc, [sysId, communityId]) => {
			if (!acc.has(communityId)) acc.set(communityId, [])
			acc.get(communityId)!.push(sysId)
			return acc
		}, new Map<string, string[]>())

	// Reduce each neighbourhood into a single representative node which can be simply rendered
	const neighbourhoodNodes: AstroJSON.Neo4J.Node.Neighbourhood[] =
		neighbourhoods.entries().map(;([anchorSysId, sysIds]) => {
			const systems = sysIds.map((id) => sysLookup.get(id)!)
			let coordsExtent = [
				{ x: 0, y: 0, z: 0 }, // Min
				{ x: 0, y: 0, z: 0 }, // Max
			]
			let totalVisualIntensity = 0
			let totalSecondaryIntensity = 0
			let weightedColor = 0
			let nDebrisDisks = 0

			// Aggregate visual and geometric properties of system
			systems.forEach((sys) => {
				// Expand hitbox coordinate bounds
				if (sys.coords.x < coordsExtent[0].x)
					coordsExtent[0].x = sys.coords.x
				else if (sys.coords.x > coordsExtent[1].x)
					coordsExtent[1].x = sys.coords.x
				if (sys.coords.y < coordsExtent[0].y)
					coordsExtent[0].y = sys.coords.y
				else if (sys.coords.y > coordsExtent[1].y)
					coordsExtent[1].y = sys.coords.y
				if (sys.coords.z < coordsExtent[0].z)
					coordsExtent[0].z = sys.coords.z
				else if (sys.coords.z > coordsExtent[1].z)
					coordsExtent[1].z = sys.coords.z
				// Calculate absolute brightness (and color)
        const vIntensity = Math.pow(10, -0.4 * sys.brightness);
        totalVisualIntensity += vIntensity;

        // Secondary band intensity derived from the logarithmic color index
        totalSecondaryIntensity += vIntensity * Math.pow(10, -0.4 * sys.color);
				// Calculate proportion of stars with circumstellar disks
				nDebrisDisks += sys.hasDebrisDisk ? 1 : 0
			})

			// Calculate center and radius for rendering as an approximated circle hitbox in the skybox
			const coords = {
				x: (coordsExtent[0].x + coordsExtent[1].x) / 2,
				y: (coordsExtent[0].y + coordsExtent[1].y) / 2,
				z: (coordsExtent[0].z + coordsExtent[1].z) / 2,
			}
			const radius = Math.hypot(
				coordsExtent[1].x - coordsExtent[0].x,
				coordsExtent[1].y - coordsExtent[0].y,
				coordsExtent[1].z - coordsExtent[0].z,
			)

			// Re-log total intensities back to standard astronomical indexes
			const brightness =
				-2.5 * Math.log10(totalVisualIntensity)
			const color =
				 -2.5 *
						Math.log10(
							totalSecondaryIntensity / totalVisualIntensity,
						)

			// Finalise aggregate values
			const node: AstroJSON.Neo4J.Node.Neighbourhood = {
				id: `${anchorSysId}-neighbourhood`,
				type: 'neighbourhood',
				nSystems: systems.length,
				coords,
				radius,
				color,
				brightness,
				debrisDiskStrength: nDebrisDisks / systems.length,
			}

			return node
		})

	// Link nearby neigbourhoods as :nearby edges

	return { neighbourhoodNodes, neighbourhoodEdges }
}
