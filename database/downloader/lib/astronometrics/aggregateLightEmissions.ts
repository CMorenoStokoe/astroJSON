import type { AstroJSON } from '../../../../types/AstroJSON'

// Aggregates an astronometrically correct light emission from a set of light sources in brightness and color
export const aggregateLightEmissions = (
	systems: AstroJSON.Neo4J.Node.System[],
): {
	brightness: number
	color: number
	maxBrightness: number
} => {
	// Represent the combined light emissions of systems as flux values which can be summed
	let totalVFlux = 0
	let totalKFlux = 0
	let maxV = 0

	// Increment over each system and sum their flux contributions
	for (const system of systems) {
		const absoluteV = system.brightness
		const absoluteK = absoluteV - system.color

		totalVFlux += 10 ** (-0.4 * absoluteV)
		totalKFlux += 10 ** (-0.4 * absoluteK)

		if (absoluteV > maxV) maxV = absoluteV
	}

	// Convert flux values back to magnitudes because these are easier to interpret for display
	const combinedV = -2.5 * Math.log10(totalVFlux)
	const combinedK = -2.5 * Math.log10(totalKFlux)

	// Derive color from combined magnitudes
	const color = combinedV - combinedK

	return {
		brightness: combinedV,
		maxBrightness: maxV,
		color,
	}
}
