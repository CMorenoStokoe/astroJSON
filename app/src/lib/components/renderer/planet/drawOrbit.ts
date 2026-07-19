import { Vector3 } from 'three';
import { RENDER_QUALITY_ORBIT_SEGMENTS } from '../../../config/settings';
import { DEG_TO_RAD } from '../../../constants/DEG_TO_RAD';
import { TAU } from '../../../constants/TAU';
import { guaranteeCompleteKeplerianOrbit } from './guaranteeCompleteKeplerianOrbit';

// Draw orbit as a line
export const drawOrbit = (planet: App.PageData['planets'][number]) => {
	const { a, e, i, w } = guaranteeCompleteKeplerianOrbit(planet.orbit); // Impute any missing values

	// Convert to radians for JS
	const inclination = i * DEG_TO_RAD;
	const periapsis = w * DEG_TO_RAD;

	// Express shape as a path comprised of many points
	const path: Vector3[] = [];
	for (let j = 0; j < RENDER_QUALITY_ORBIT_SEGMENTS; j++) {
		// Construct 2d orbit plane in 3d space
		const eccentricAnomaly = (j / RENDER_QUALITY_ORBIT_SEGMENTS) * TAU;

		const orbitalX = a * (Math.cos(eccentricAnomaly) - e);
		const orbitalZ = a * Math.sqrt(1 - e * e) * Math.sin(eccentricAnomaly);

		const rotatedX = orbitalX * Math.cos(periapsis) - orbitalZ * Math.sin(periapsis);
		const rotatedZ = orbitalX * Math.sin(periapsis) + orbitalZ * Math.cos(periapsis);

		// Create vector3 points ready for consumption in threlte
		const point = new Vector3(
			rotatedX,
			rotatedZ * Math.sin(inclination),
			rotatedZ * Math.cos(inclination)
		);

		path.push(point);
	}

	return path;
};
