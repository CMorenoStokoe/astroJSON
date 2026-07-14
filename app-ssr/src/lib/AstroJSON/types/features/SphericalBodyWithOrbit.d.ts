import { SphericalBody } from './SphericalBody';

/**
 * # Spherical Body (with orbit)
 * @description Interface for mapping orbital bodies (e.g., planets, moons) using Keplerian orbital elements
 * @link [Keplerian Elements](https://www.sternula.com/space-curiosity-keplerian-elements/)
 */

declare global {
	namespace AstroJSON.Feature {
		interface SphericalBodyWithOrbit extends SphericalBody {
			properties: SphericalBody['properties'] & {
				// Keplerian elements used to simulate orbital mechanics
				orbit: {
					origin: string | [number, number, number]; // Centre of origin about which this body orbits (ID of its host body, or static coordinates)
					period: number; // Orbital Period (days) - drives velocity
					semiMajorAxis: number; // Semi-major Axis (AU) - drives distance
					eccentricity: number; // Eccentricity - drives orbital shape
					inclination: number; // Inclination (degrees) - drives orbital tilt
				};
			};
		}
	}
}
