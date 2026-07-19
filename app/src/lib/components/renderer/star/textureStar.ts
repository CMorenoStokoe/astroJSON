// Returns threlte texture for a star
export const textureStar = (star: AstroJSON.Renderer.Star) => {
	// Color star
	const color =
		star.temperature < 3500
			? '#ff4500' // Red
			: star.temperature < 5000
				? '#ffa500' // Orange
				: star.temperature < 6000
					? '#ffff00' // Yellow
					: star.temperature < 7500
						? '#ffffff' // White
						: star.temperature < 10000
							? '#add8e6' // Light Blue
							: star.temperature < 30000
								? '#87ceeb' // Blue
								: '#0000ff'; // Dark Blue

	return { color };
};
