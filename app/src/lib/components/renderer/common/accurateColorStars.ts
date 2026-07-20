import { Color } from 'three';

// Accurately colors stars using astronometric principles
export const accurateColorStar = (
	star: AstroJSON.Renderer.Star | AstroJSON.Renderer.System | AstroJSON.Renderer.VisibleSystemInSky
): Color => {
	// Estimate temperature from the system's V-K color index when no direct temperature is available
	const colorIndexToTemperature = (colorIndex: number): number => {
		const scale = [
			[-0.9, 30_000],
			[-0.3, 11_000],
			[0, 8_500],
			[0.5, 7_000],
			[1, 6_000],
			[1.55, 5_772],
			[2, 5_000],
			[3, 4_000],
			[4, 3_400],
			[5, 3_000],
			[8, 2_500]
		];

		const clamped = Math.max(scale[0][0], Math.min(scale.at(-1)![0], colorIndex));

		for (let i = 0; i < scale.length - 1; i++) {
			const [minimumColor, maximumTemperature] = scale[i];
			const [maximumColor, minimumTemperature] = scale[i + 1];

			if (clamped >= minimumColor && clamped <= maximumColor) {
				const progress = (clamped - minimumColor) / (maximumColor - minimumColor);

				return maximumTemperature + (minimumTemperature - maximumTemperature) * progress;
			}
		}

		return 5_772;
	};

	// Convert temperature into a conventional visible star colour
	const temperatureToColor = (temperature: number): Color => {
		const t = Math.max(1_000, Math.min(40_000, temperature));

		const colors: [number, string][] = [
			[1_000, '#ff3300'],
			[2_500, '#ff7a38'],
			[4_000, '#ffb56b'],
			[5_772, '#fff2a8'], // Sun: yellow-white
			[7_500, '#ffffff'],
			[10_000, '#dbe9ff'],
			[40_000, '#9bbcff']
		];

		for (let i = 0; i < colors.length - 1; i++) {
			const [minimumTemperature, minimumColor] = colors[i];
			const [maximumTemperature, maximumColor] = colors[i + 1];

			if (t >= minimumTemperature && t <= maximumTemperature) {
				const progress = (t - minimumTemperature) / (maximumTemperature - minimumTemperature);

				return new Color(minimumColor).lerp(new Color(maximumColor), progress);
			}
		}

		return new Color('#fff2a8');
	};

	// Prefer measured temperature; otherwise estimate it from the V-K color index
	const temperature =
		'temperature' in star && Number.isFinite(Number(star.temperature))
			? Number(star.temperature)
			: 'color' in star && Number.isFinite(Number(star.color))
				? colorIndexToTemperature(Number(star.color))
				: 5_772;

	return temperatureToColor(temperature);
};
