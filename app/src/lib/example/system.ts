// Example system data using solar system
export const SOL_SYSTEM: App.PageData = {
	system: {
		name: 'Solar System',
		coords: [0, 0, 0],
		brightness: 4.83,
		color: 1.48,
		hasDebrisDisk: true
	},
	stars: [
		{
			name: 'Sun',
			temperature: 5778,
			radius: 1,
			mass: 1,
			luminosity: 0,
			chromosphericActivity: -4.9,
			radialVelocity: 0,
			period: 25.05
		}
	],
	planets: [
		{
			name: 'Mercury',
			classification: 'Mercurian',
			temperature: 440,
			density: 5.43,
			radius: 0.383,
			axialTilt: 0.03,
			hasAtmosphere: false,
			discoveryDate: 'Prehistory',
			discoveryReference: 'Known since antiquity',
			orbit: {
				distance: 0.387,
				isCircumbinary: false,
				a: 0.387,
				e: 0.2056,
				i: 7.0,
				w: 29.1,
				M: 174.8,
				P: 87.97
			}
		},
		{
			name: 'Venus',
			classification: 'Terrestrial',
			temperature: 737,
			density: 5.24,
			radius: 0.949,
			axialTilt: 177.4,
			hasAtmosphere: true,
			discoveryDate: 'Prehistory',
			discoveryReference: 'Known since antiquity',
			orbit: {
				distance: 0.723,
				isCircumbinary: false,
				a: 0.723,
				e: 0.0068,
				i: 3.39,
				w: 54.9,
				M: 50.1,
				P: 224.7
			}
		},
		{
			name: 'Earth',
			classification: 'Terrestrial',
			temperature: 288,
			density: 5.51,
			radius: 1.0,
			axialTilt: 23.44,
			hasAtmosphere: true,
			discoveryDate: 'Prehistory',
			discoveryReference: 'Known since antiquity',
			orbit: {
				distance: 1.0,
				isCircumbinary: false,
				a: 1.0,
				e: 0.0167,
				i: 0.0,
				w: 102.9,
				M: 357.5,
				P: 365.25
			}
		},
		{
			name: 'Mars',
			classification: 'Terrestrial',
			temperature: 210,
			density: 3.93,
			radius: 0.532,
			axialTilt: 25.19,
			hasAtmosphere: true,
			discoveryDate: 'Prehistory',
			discoveryReference: 'Known since antiquity',
			orbit: {
				distance: 1.524,
				isCircumbinary: false,
				a: 1.524,
				e: 0.0934,
				i: 1.85,
				w: 286.5,
				M: 19.4,
				P: 686.98
			}
		},
		{
			name: 'Jupiter',
			classification: 'Jovian',
			temperature: 165,
			density: 1.33,
			radius: 11.21,
			axialTilt: 3.13,
			hasAtmosphere: true,
			discoveryDate: 'Prehistory',
			discoveryReference: 'Known since antiquity',
			orbit: {
				distance: 5.203,
				isCircumbinary: false,
				a: 5.203,
				e: 0.0489,
				i: 1.3,
				w: 273.9,
				M: 20.0,
				P: 4332.59
			}
		},
		{
			name: 'Saturn',
			classification: 'Jovian',
			temperature: 134,
			density: 0.69,
			radius: 9.45,
			axialTilt: 26.73,
			hasAtmosphere: true,
			discoveryDate: 'Prehistory',
			discoveryReference: 'Known since antiquity',
			orbit: {
				distance: 9.537,
				isCircumbinary: false,
				a: 9.537,
				e: 0.0565,
				i: 2.49,
				w: 339.4,
				M: 317.0,
				P: 10759.22
			}
		},
		{
			name: 'Uranus',
			classification: 'Neptunian',
			temperature: 76,
			density: 1.27,
			radius: 4.01,
			axialTilt: 97.77,
			hasAtmosphere: true,
			discoveryDate: '1781-03',
			discoveryReference: 'William Herschel (1781)',
			orbit: {
				distance: 19.191,
				isCircumbinary: false,
				a: 19.191,
				e: 0.0472,
				i: 0.77,
				w: 96.7,
				M: 142.2,
				P: 30688.5
			}
		},
		{
			name: 'Neptune',
			classification: 'Neptunian',
			temperature: 72,
			density: 1.64,
			radius: 3.88,
			axialTilt: 28.32,
			hasAtmosphere: true,
			discoveryDate: '1846-09',
			discoveryReference: 'Galle and dArrest (1846)',
			orbit: {
				distance: 30.07,
				isCircumbinary: false,
				a: 30.07,
				e: 0.0086,
				i: 1.77,
				w: 273.2,
				M: 256.2,
				P: 60182.0
			}
		}
	],
	visibleSystems: []
};
