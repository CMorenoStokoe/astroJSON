import { AstroJSON } from '../../../../types/AstroJSON'
import { calculateDistanceInRenderspace } from '../renderer/calculateDistanceInRenderspace'

const SECTOR_SIZE = 25 // Parsecs

// Neighbours are stored as edges to nodes so are efficiently retrieved once a system comes into focus
export const getNearbySystems = (
	systems: AstroJSON.Neo4J.Node.System[],
): { source: string; target: string; distance: number }[] => {
	// Create lookup for batching together neighbours by approximate xyz space
	const sectors: Map<string, AstroJSON.Neo4J.Node.System[]> = new Map()
	for (let i = 0; i < systems.length; i++) {
		// Approximate coords to nearest {SECTOR_SIZE} parsecs
		const coords = {
			x: Math.floor(systems[i].coords.x / SECTOR_SIZE) * SECTOR_SIZE,
			y: Math.floor(systems[i].coords.y / SECTOR_SIZE) * SECTOR_SIZE,
			z: Math.floor(systems[i].coords.z / SECTOR_SIZE) * SECTOR_SIZE,
		}
		const key = `${coords.x}.${coords.y}.${coords.z}`
		if (!sectors.has(key)) sectors.set(key, [systems[i]])
		else sectors.get(key)!.push(systems[i])
	}

	// Get each adjoining neighbouring sector
	const edges: { source: string; target: string; distance: number }[] = []
	for (const [sector, systems] of sectors.entries()) {
		const [x, y, z] = sector.split('.').map(Number)
		// Iterate through each of the 26 neighbouring sectors (3x3x3 cube minus the center sector)
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				for (let dz = -1; dz <= 1; dz++) {
					if (dx === 0 && dy === 0 && dz === 0) continue // Exclude the current sector

					// Construct and check if there is a sector with adjacent coords
					const nearbySector = [
						x + dx * SECTOR_SIZE,
						y + dy * SECTOR_SIZE,
						z + dz * SECTOR_SIZE,
					].join('.')
					const nearbySystems = sectors.get(nearbySector)

					// Create edges between this sector and any neighbouring sector systems
					if (nearbySystems?.length) {
						for (const system of systems)
							for (const nearbySystem of nearbySystems)
								edges.push({
									source: system.id,
									target: nearbySystem.id,
									distance: calculateDistanceInRenderspace(
										system.coords,
										nearbySystem.coords,
									).distance,
								})
					}
				}
			}
		}
	}

	return edges
}
