import type { Cartesian3DCoords } from './astrometrics';
import { Spherical, VectorFromSphere, AstroTime } from 'astronomy-engine';

/**
 * # ICRF to Cartesian Coordinates
 * @param d AstroJSON.Position - An AstroJSON array of ICRF spherical coordinates [raHours, decDegrees, radius]
 * @description Converts ICRF spherical coordinates (ra, decl, distance) to Cartesian coordinates (x,y,z)
 */

export const icrfToCartesian = ([ra, l, d]: AstroJSON.Position) => {
	// Define your spherical coordinates (RA in hours, Dec in degrees, distance in AU)
	// Let's place an object at RA = 12h, Dec = +45°, at a distance of 2.5 AU
	const raHours = 12.0;
	const decDegrees = 45.0;
	const distanceAU = 2.5;

	// Convert RA from hours to degrees (astronomy-engine expects degrees for both)
	const raDegrees = raHours * 15;

	// Create a Spherical object using astronomy-engine
	const sphere = new Spherical(
		decDegrees, // Latitude / Declination
		raDegrees, // Longitude / Right Ascension
		distanceAU // Distance from center (Barycentric or Geocentric depending on context)
	);

	// Convert to Cartesian Vector {x, y, z} in AU
	const j2000 = AstroTime.FromTerrestrialTime(0);
	const cartesianVector = VectorFromSphere(sphere, j2000);

	console.log(`X: ${cartesianVector.x} AU`);
	console.log(`Y: ${cartesianVector.y} AU`);
	console.log(`Z: ${cartesianVector.z} AU`);
};
