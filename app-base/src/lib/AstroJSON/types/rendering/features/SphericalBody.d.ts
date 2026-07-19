import { AstroJSON } from '../AstroJSON';

// Interface representing a spherical body (e.g., stars, planets etc.)
namespace AstroJSON.Feature {
	interface SphericalBody extends AstroJSON.Feature<AstroJSON.Geometry, AstroJSON.Properties> {
		id: string;
		type: 'Feature';
		geometry: {
			type: 'Point';
			coordinates: [number, number, number]; // Position of the body's centre
		};
		properties: {
			// Reference time
			M: AstroJSON.Properties['M'];
			// Radius to draw the body as a sphere
			radius: number; // km
		};
	}
}
