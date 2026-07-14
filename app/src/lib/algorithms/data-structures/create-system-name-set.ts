import systems from '../../data/systems.json'

// Valid system name checker
// Input is a system name
// Check data to see if it exists
// Output is boolean

// Construct set from data
const uniqueNames = new Set()
systems.forEach(({ name }) => uniqueNames.add(name))

// Construct checker if system name is valid
export const isValidSystem = (name: string) => uniqueNames.has(name)
console.log(isValidSystem('11 Com')) // T
console.log(isValidSystem('11 com')) // F

// Expand checker to be case insensitive
const uniqueNamesI = new Set()
systems.forEach(({ name }) => uniqueNamesI.add(name.toLowerCase()))
export const isValidSystemI = (name: string) =>
	uniqueNamesI.has(name.toLowerCase())
console.log(isValidSystemI('11 com')) // T
