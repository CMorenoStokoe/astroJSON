import { AstroJSON } from '../AstroJSON';

/**
 * # VolumetricBody
 * @description A Polygon in 3D as an array of rings, where each ring is an array of [l, b, d] coordinates in galactic space
 * @example
 * const simpleTriangularPyramid = [ [ [x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x1, y1, z1] ] ]
 * @example
 * const complexPolygon = [
 * [ [x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], [x1, y1, z1] ],
 * [ [x5, y5, z5], [x6, y6, z6], [x7, y7, z7], [x5, y5, z5]	]
 * ]
 */

// Interface representing a volumetric body (e.g., nebula, gas cloud, defining galactic borders etc.)
declare global {
	namespace AstroJSON.Feature {
		interface VolumetricBody extends AstroJSON.Feature<AstroJSON.Geometry, AstroJSON.Properties> {
			id: string;
			type: 'Feature';
			geometry: {
				type: 'Polygon';
				coordinates: [number, number, number][][]; // Polygon in 3D galactic coordinate space [l, b, d]
			};
			properties: {
				M: 'J2000'; // Reference time
			};
		}
	}
}
