import systems from '../../data/systems.json'

// System color lookup
// Input system color
// Search through planets to find those which have same color
// Output list of systems matching input

// Transform color magnitudes to categories for grouping
const magnitudeToColor = (color: number) => {
	if (color == null || !Number.isFinite(color)) return 'unknown'
	if (color < -1) return 'invalid'
	if (color < -0.1) return 'blue'
	if (color < 0.6) return 'blue-white'
	if (color < 1.35) return 'white'
	if (color < 1.8) return 'yellow-white'
	if (color < 2.4) return 'yellow-orange'
	if (color < 3.4) return 'orange'
	if (color < 5.5) return 'red-orange'
	if (color <= 8.5) return 'red'
	return 'extreme-infrared'
}

// Organise systems by color
const planetCountLookup = new Map<string, string[]>()
for (const system of systems) {
	planetCountLookup.get(magnitudeToColor(system.color))
		? planetCountLookup
				.get(magnitudeToColor(system.color))
				.push(system.name)
		: planetCountLookup.set(magnitudeToColor(system.color), [system.name])
}

// Get systems by color
const getSystemsByColor = (colorName: ReturnType<typeof magnitudeToColor>) =>
	planetCountLookup.get(colorName)
console.log('all systems', systems.length)
console.log('blue', getSystemsByColor('blue')?.length)
console.log('blue-white', getSystemsByColor('blue-white')?.length)
console.log('white', getSystemsByColor('white')?.length)
console.log('yellow-white', getSystemsByColor('yellow-white')?.length)
console.log('yellow-orange', getSystemsByColor('yellow-orange')?.length)
console.log('orange', getSystemsByColor('orange')?.length)
console.log('red-orange', getSystemsByColor('red-orange')?.length)
console.log('red', getSystemsByColor('red')?.length)
console.log('extreme-infrared', getSystemsByColor('extreme-infrared')?.length)
console.log('invalid', getSystemsByColor('invalid')?.length)
