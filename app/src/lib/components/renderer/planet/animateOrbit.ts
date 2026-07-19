import { SIMULATION_RATE_DAYS_PER_SECOND } from '$lib/config/settings';
import type { Writable } from 'svelte/store';
import { DEG_TO_RAD } from '../../../constants/DEG_TO_RAD';
import { TAU } from '../../../constants/TAU';
import { guaranteeCompleteKeplerianOrbit } from './guaranteeCompleteKeplerianOrbit';

/**
 * Animate Orbit
 * @description Animates a body in 3d render space using keplerian orbital elements
 * @see {AstroJSON.Schema.KeplerianOrbitalElements} for the orbital parameters used in this function
 */
export const animateOrbit = (
	position: Writable<[x: number, y: number, z: number]>,
	planet: App.PageData['planets'][number]
) => {
	const { a, e, i, w, M, P } = guaranteeCompleteKeplerianOrbit(planet.orbit); // Impute any missing values

	// Track elapsed time in simulation
	let elapsedDays = 0;

	// Preprocess as much of the orbital parameters as possible to avoid repeated calculations
	const preSolved = {
		initialMeanAnomaly: M * DEG_TO_RAD,
		meanAnomalyPerDay: TAU / P,
		orbitalZScale: a * Math.sqrt(1 - e * e),
		cosPeriapsis: Math.cos(w * DEG_TO_RAD),
		sinPeriapsis: Math.sin(w * DEG_TO_RAD),
		sinInclination: Math.sin(i * DEG_TO_RAD),
		cosInclination: Math.cos(i * DEG_TO_RAD)
	};

	// Return minimal function to update position based on delta time
	return (delta: number) => {
		// Increment elapsed time each frame call
		elapsedDays += delta * SIMULATION_RATE_DAYS_PER_SECOND;

		// Current mean anomaly
		const meanAnomaly =
			(preSolved.initialMeanAnomaly + preSolved.meanAnomalyPerDay * elapsedDays) % TAU;

		// Solve Kepler's equation: M = E - e sin(E)
		let eccentricAnomaly = meanAnomaly;
		for (let iteration = 0; iteration < 8; iteration++) {
			const sinE = Math.sin(eccentricAnomaly);
			const cosE = Math.cos(eccentricAnomaly);
			eccentricAnomaly -= (eccentricAnomaly - e * sinE - meanAnomaly) / (1 - e * cosE);
		}

		// Calculate position in 3D space
		const sinE = Math.sin(eccentricAnomaly);
		const cosE = Math.cos(eccentricAnomaly);

		// Position in the orbital plane
		const orbitalX = a * (cosE - e);
		const orbitalZ = preSolved.orbitalZScale * sinE;

		// Rotate by argument of periapsis
		const rotatedX = orbitalX * preSolved.cosPeriapsis - orbitalZ * preSolved.sinPeriapsis;
		const rotatedZ = orbitalX * preSolved.sinPeriapsis + orbitalZ * preSolved.cosPeriapsis;

		// Tilt by inclination
		position.set([
			rotatedX,
			rotatedZ * preSolved.sinInclination,
			rotatedZ * preSolved.cosInclination
		]);
	};
};
