import type { AstroJSON } from '../types/AstroJSON';

export const solarSystemData: AstroJSON.Kit.Features.SystemFeatureSet = {
	type: 'FeatureCollection',
	features: [
		// 1. THE SUN (Static center point, standard SphericalBody)
		{
			id: 'sol',
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [0, 0, 0] // Sits at the origin of the system
			},
			properties: {
				M: 0, // Reference time/mean anomaly
				radius: 696340 // Physical radius in km
			}
		} satisfies SphericalBody,

		// 2. EARTH (Orbits the Sun)
		{
			id: 'earth',
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [1.0, 0, 0] // Starting position vector
			},
			properties: {
				M: 0,
				radius: 6371, // Physical radius in km
				orbit: {
					origin: 'sol', // Orbits the Sun
					period: 365.25, // 1 Earth year in days
					semiMajorAxis: 1.0, // 1 AU distance from Sun
					eccentricity: 0.0167, // Nearly circular orbit
					inclination: 0.0 // Earth's orbital plane is our baseline reference (0°)
				}
			}
		} satisfies SphericalBodyWithOrbit,

		// 3. THE MOON (Orbits the Earth)
		{
			id: 'moon',
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [1.0025, 0, 0] // Relative/Absolute starting position vector
			},
			properties: {
				M: 0,
				radius: 1737, // Physical radius in km
				orbit: {
					origin: 'earth', // Orbits the Earth dynamically
					period: 27.3, // ~27 days to complete an orbit
					semiMajorAxis: 0.00257, // Translated Moon-to-Earth distance in AU
					eccentricity: 0.0549, // Slightly elongated ellipse
					inclination: 5.14 // Visually tilted relative to Earth's plane
				}
			}
		} satisfies SphericalBodyWithOrbit
	]
};
