import systems from '../../data/systems.json'

// System lookup
// Input is name string
// Search through rows of csv to find relevant match
// Output is single matching entry {name:string, ...}

// Create map to store systems
const systemLookup = new Map()

// Iterate over each system and store it in the map by id
for (let i = 0; i < systems.length - 1; i++) {
	systemLookup.set(systems[i].name, systems[i])
}

// Create function to get system by name
export const getSystemByName = (name: string) => systemLookup.get(name)
console.log(getSystemByName('11 Com'))
