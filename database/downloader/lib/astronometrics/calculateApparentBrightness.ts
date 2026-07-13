import type { AstroJSON } from '../../../../types/AstroJSON'

// Calculates the apparent brightness of a system based on its absolute brightness and distance from the observer system
const calculateApparentBrightness = (
	brightness: AstroJSON.Schema.System['brightness'], // Absolute brightness of the system (in magnitudes)
	distance: number, // Distance from the observer system (in parsecs)
): {
	apparentBrightness: AstroJSON.Schema.System['brightness'] // Apparent brightness of the system (in magnitudes)
	isVisible: boolean // Whether the system is visible to the naked eye (apparent brightness < 6.5)
} => {
	const apparentBrightness = brightness + 5 * Math.log10(distance) - 5
	const isVisible = apparentBrightness <= 6.5

	return {
		apparentBrightness,
		isVisible,
	}
}
