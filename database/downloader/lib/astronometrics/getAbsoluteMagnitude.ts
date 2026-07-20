const EPSILON = 1e-9
// Convert absolute brightness from earth-based apparent brightness measurements
export const getAbsoluteMagnitude = (
	apparentBrightness: number,
	distance: number, // pc
): number =>
	distance === 0 // Need to handle sol as a special case of the only expected zero-distance observation
		? 4.83
		: apparentBrightness -
			5 * Math.log10(distance > 0 ? distance : EPSILON) +
			5
