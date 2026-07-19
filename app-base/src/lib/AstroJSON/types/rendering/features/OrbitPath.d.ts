import { AstroJSON } from '../AstroJSON';
/**
 * # Orbit path
 * @description Interface for mapping the trajectory of orbital bodies as a path (e.g., planets, moons)
 */

namespace AstroJSON.Feature {
	interface OrbitPath extends AstroJSON.Feature<AstroJSON.Geometry, AstroJSON.Properties> {
		id: string;
		type: 'Feature';
		geometry: {
			type: 'LineString';
			coordinates: [number, number, number][]; // Array of [x, y, z] coordinates representing the orbit path (derived from orbital elements [l, d, ])
		};
		properties: {
			M: AstroJSON.Properties['M']; // Reference time (epoch for which the orbital path shown was valid)
		};
	}
}
