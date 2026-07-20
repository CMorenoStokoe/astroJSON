// Space out multi-star systems around the center
export const spaceOutMultiStarSystem = (
	index: number,
	nStars: number,
	scaleStarSize: number,
	radii: number[]
): [x: number, y: number, z: number] => {
	if (nStars <= 1) return [0, 0, 0]; // circumbinary test sys = HD 133131

	const largestRadius = Math.max(...radii) * scaleStarSize;

	const angle = (index / nStars) * Math.PI * 2;

	const spacingRadius = Math.max(0.02, largestRadius / Math.sin(Math.PI / nStars));

	return [Math.cos(angle) * spacingRadius, 0, Math.sin(angle) * spacingRadius];
};
