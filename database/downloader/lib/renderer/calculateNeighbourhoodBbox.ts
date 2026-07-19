import type { AstroJSON } from '../../../../types/AstroJSON'
// Calculates the bounding box (bbox) for a neighbourhood of systems in 3d cartesian render space
export const calculateNeighbourhoodBbox = (
	systems: AstroJSON.Neo4J.Node.System[],
): {
	centrum: AstroJSON.Neo4J.Node.Neighbourhood['centrum']
	radius: AstroJSON.Neo4J.Node.Neighbourhood['radius']
	bbox: AstroJSON.Neo4J.Node.Neighbourhood['bbox']
} => {
	let bbox = {
		min: [systems[0].coords[0], systems[0].coords[1], systems[0].coords[2]],
		max: [systems[0].coords[0], systems[0].coords[1], systems[0].coords[2]],
	}

	// Aggregate visual and geometric properties of system
	for (const sys of systems) {
		// Expand bbox coordinate bounds
		if (sys.coords[0] < bbox.min[0]) bbox.min[0] = sys.coords[0]
		else if (sys.coords[0] > bbox.max[0]) bbox.max[0] = sys.coords[0]
		if (sys.coords[1] < bbox.min[1]) bbox.min[1] = sys.coords[1]
		else if (sys.coords[1] > bbox.max[1]) bbox.max[1] = sys.coords[1]
		if (sys.coords[2] < bbox.min[2]) bbox.min[2] = sys.coords[2]
		else if (sys.coords[2] > bbox.max[2]) bbox.max[2] = sys.coords[2]
	}

	// Calculate center and radius for rendering as an approximated circle bbox in the skybox
	const coords = [
		(bbox.min[0] + bbox.max[0]) / 2, // x
		(bbox.min[1] + bbox.max[1]) / 2, // y
		(bbox.min[2] + bbox.max[2]) / 2, // z
	]
	const radius = Math.hypot(
		bbox.max[0] - bbox.min[0],
		bbox.max[1] - bbox.min[1],
		bbox.max[2] - bbox.min[2],
	)

	return {
		centrum: [coords[0], coords[1], coords[2]],
		radius,
		bbox: [
			bbox.min[0],
			bbox.min[1],
			bbox.min[2],
			bbox.max[0],
			bbox.max[1],
			bbox.max[2],
		],
	}
}
