import {
	IMPUTED_AVERAGE_PLANET_SPIN_RATE,
	SIMULATION_RATE_DAYS_PER_SECOND
} from '$lib/config/settings';
import { TAU } from '../../../constants/TAU';
import type { Writable } from 'svelte/store';

// Rotate planet
export const rotatePlanet = (
	rotationStore: Writable<number>,
	// Impute rotation period by sampling from a normal distribution of rotations rates in sol system
	rotationPeriodDays: number = Math.max(
		0.01,
		IMPUTED_AVERAGE_PLANET_SPIN_RATE +
			IMPUTED_AVERAGE_PLANET_SPIN_RATE *
				0.4 *
				Math.sqrt(-2 * Math.log(Math.random())) *
				Math.cos(TAU * Math.random())
	)
) => {
	// Convert rotation period to simulation seconds (e.g., simulate one day per second)
	const rotationPerSimulationSecond = rotationPeriodDays / SIMULATION_RATE_DAYS_PER_SECOND;

	// Represent as a geometric rotation in radians
	const radiansPerSecond = (Math.PI * 2) / rotationPerSimulationSecond;

	// Return function to update rotation based on delta time
	return (
		delta: number // Seconds since last frame draw
	) => rotationStore.update((currentRotation) => currentRotation + radiansPerSecond * delta);
};
