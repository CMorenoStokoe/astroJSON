import { STAR_INTENSITY_MULTIPLIER } from '$lib/config/settings';

// Calculate Threlte PointLight intensity from luminosity (log sun brightnesses)
export const calculateStarIntensity = (
	logLuminosity = 0 // Default to one sun
) => STAR_INTENSITY_MULTIPLIER * 10 ** logLuminosity;
