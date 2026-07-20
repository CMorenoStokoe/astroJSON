const EPSILON = 1e-9
// Convert apparent brightness from absolute brightness and distance measurements
export const getApparentBrightness = (
	absoluteMagnitude: number,
	distance: number, // pc
): number =>
	absoluteMagnitude + 5 * Math.log10(distance > 0 ? distance : EPSILON) - 5
