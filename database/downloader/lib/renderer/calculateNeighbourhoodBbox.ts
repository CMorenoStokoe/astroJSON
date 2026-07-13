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
		min: { x: 0, y: 0, z: 0 },
		max: { x: 0, y: 0, z: 0 },
	}

	// Aggregate visual and geometric properties of system
	for (const sys of systems) {
		// Expand bbox coordinate bounds
		if (sys.coords.x < bbox.min.x) bbox.min.x = sys.coords.x
		else if (sys.coords.x > bbox.max.x) bbox.max.x = sys.coords.x
		if (sys.coords.y < bbox.min.y) bbox.min.y = sys.coords.y
		else if (sys.coords.y > bbox.max.y) bbox.max.y = sys.coords.y
		if (sys.coords.z < bbox.min.z) bbox.min.z = sys.coords.z
		else if (sys.coords.z > bbox.max.z) bbox.max.z = sys.coords.z
	}

	// Calculate center and radius for rendering as an approximated circle bbox in the skybox
	const coords = {
		x: (bbox.min.x + bbox.max.x) / 2,
		y: (bbox.min.y + bbox.max.y) / 2,
		z: (bbox.min.z + bbox.max.z) / 2,
	}
	const radius = Math.hypot(
		bbox.max.x - bbox.min.x,
		bbox.max.y - bbox.min.y,
		bbox.max.z - bbox.min.z,
	)

	return {
		centrum: coords,
		radius,
		bbox,
	}
}
