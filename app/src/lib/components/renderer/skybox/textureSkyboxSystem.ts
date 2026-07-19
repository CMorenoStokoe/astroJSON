import { Color } from 'three';
import { STAR_INTENSITY_MULTIPLIER } from '../../../config/settings';

// Returns threlte texture for a system in the skybox visible from the current system
export const textureSkyboxSystem = (system: AstroJSON.Renderer.VisibleSystemInSky) => {
	// Color system (from standardized decimal value)
	const colorIndexToStarColor = (colorScaleValue: number): Color => {
		// Define colors as pre-prepared three.js objects
		const blue = new Color('#9bbcff');
		const white = new Color('#fff8f0');
		const yellow = new Color('#fff0b0');
		const orange = new Color('#ffc080');
		const red = new Color('#ff8060');

		// Assign color along the scale
		if (colorScaleValue < 0.25) return blue.clone().lerp(white, colorScaleValue / 0.25);
		else if (colorScaleValue < 0.5)
			return white.clone().lerp(yellow, (colorScaleValue - 0.25) / 0.25);
		else if (colorScaleValue < 0.75)
			return yellow.clone().lerp(orange, (colorScaleValue - 0.5) / 0.25);
		else return orange.clone().lerp(red, (colorScaleValue - 0.75) / 0.25);
	};
	const color = colorIndexToStarColor(system.color);

	// Calculate brightness
	const magnitudeToBrightness = (apparentMagnitude: number): number =>
		Math.max(
			0.05,
			Math.min(1, STAR_INTENSITY_MULTIPLIER * 10 ** (-0.4 * (apparentMagnitude + 1.5)))
		);
	const brightness = magnitudeToBrightness(system.viewpoint.apparentBrightness);

	color.multiplyScalar(brightness);

	return {
		color,
		brightness: magnitudeToBrightness(system.brightness),
		hasDebrisDisk: system.hasDebrisDisk
	};
};
