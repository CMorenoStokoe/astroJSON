// Simulation settings object to control simulation
export const simulationSettings = {
	// Quality
	quality: {
		orbitSegments: 128
	},
	// Appearance
	appearance: {
		distantStarIntensityMultiplier: 1500, // Uniform rendered brightness multiplier
		localStarIntensityMultiplier: 50, // Multiplier only for stars in the local system
		scaleStarSize: 50, // Scale the size of stars
		scalePlanetSize: 1000, // Scale the size of planets
		skyboxDistance: 500, // Distance from the centre of the scene that the skybox is drawn
		skyboxStarLabelSize: 30 // Size of star labels in the skybox
	},
	// Simulation
	simulation: {
		rateDaysPerSecond: 100, // Simulation speed
		imputedAveragePlanetSpinRate: 38 // Average spin rate for planets without a known rotation period
	}
};
