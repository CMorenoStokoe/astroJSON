import { MINIFIED_FIELDS } from './api/NASA/exoplanet-catalog/getExoPlanet'
import { MINIFIED_STAR_FIELDS } from './api/NASA/exoplanet-catalog/getStar'
import { MINIFIED_SYSTEM_FIELDS } from './api/NASA/exoplanet-catalog/getSystem'
import { NASA } from '../../types/NASA'
import { AstroJSON } from '../../types/AstroJSON'
import fs from 'node:fs'
import path from 'node:path'
import { planetFromNasaExo } from './lib/schema/planetFromNasaExo'
import { starFromNasaExo } from './lib/schema/starFromNasaExo'
import { systemFromNasaExo } from './lib/schema/systemFromNasaExo'
import { getNeighbours } from './lib/renderer/getNeighbours'

const OUT_DIR = 'data/raw'
const OUT_FILE_EXO = path.join(OUT_DIR, 'planets-exogenous.csv')
const OUT_FILE_STAR = path.join(OUT_DIR, 'stars-exogenous.csv')
const OUT_FILE_SYS = path.join(OUT_DIR, 'systems-exogenous.csv')
const OUT_FILE_UNIVERSE_GRAPH = path.join(
	OUT_DIR,
	'universe-graph-exogenous.json',
)

// Helpers
const parseNasaFile = (filename: string, fields: any) =>
	fs
		.readFileSync(filename, 'utf8')
		.split('\n')
		.slice(1)
		.map((line) =>
			Object.fromEntries(
				line.split(',').map((value, index) => [fields[index], value]),
			),
		)
		.filter((record) => Object.values(record).some((value) => value !== '')) // Blank rows
		.map((record) => record as NASA.ExoplanetArchiveRecord)

// Main
const run = async () => {
	// # Pre-process (graph data format)
	console.log('All API data fetched successfully. Ready for preprocessing.')

	// Exoplanets and their orbits
	const exoPlanetsAndOrbits = parseNasaFile(OUT_FILE_EXO, MINIFIED_FIELDS)
		.map(planetFromNasaExo)
		.filter((x) => x !== null)
	console.log(`Got ${exoPlanetsAndOrbits.length} planets and their orbits...`)

	// Stars
	const exoStars = parseNasaFile(OUT_FILE_STAR, MINIFIED_STAR_FIELDS)
		.map(starFromNasaExo)
		.filter((x) => x !== null)
	console.log(`Got ${exoStars.length} stars...`)

	// Systems (and their neighbours)
	const nasaExoSystemData = parseNasaFile(
		OUT_FILE_SYS,
		MINIFIED_SYSTEM_FIELDS,
	)
	const exoSystems = nasaExoSystemData
		.map(systemFromNasaExo)
		.filter((x) => x !== null)
	console.log(`Got ${exoSystems.length} systems...`)
	const eoxSystemNeighbours = exoSystems.flatMap((source) =>
		getNeighbours(source, exoSystems),
	)
	console.log(`Got ${eoxSystemNeighbours.length} system neighbours...`)

	// Galaxies
	const galaxyNodes: AstroJSON.Neo4J.Node.Galaxy[] = [
		{
			id: 'milky-way',
			type: 'galaxy',
			name: 'Milky Way', // Standardized galaxy name (e.g., 'Milky Way')
		},
	]
	console.log(`Got ${galaxyNodes.length} galaxy nodes...`)

	return

	// Edges
	const orbitEdges: AstroJSON.Neo4J.Edge.Orbit[] = planetNodes.map(
		(planetNode) => {
			const d = planetNode.data

			const DEG_TO_RAD = Math.PI / 180

			// Generate a deterministic spatial rotation angle (O) since transit data leaves it null
			const nameHash = d.pl_name
				.split('')
				.reduce((acc, char) => acc + char.charCodeAt(0), 0)
			const longitudeOfAscendingNode = (nameHash % 360) * DEG_TO_RAD

			// Set up mean anomaly epoch phase baseline
			const meanAnomalyAtEpoch = d.pl_orbtper
				? d.pl_orbtper % (2 * Math.PI)
				: 0

			return {
				source: planetNode.id,
				target: nameToId(d.hostname),
				type: 'orbits' as const,
				path: {
					a: d.pl_orbsmax ?? 0, // Size: Left strictly in AU to match your bodyScale
					e: d.pl_orbeccen ?? 0, // Shape: pure ratio (0-1)
					i: (d.pl_orbincl ?? 0) * DEG_TO_RAD, // Tilt: converted to Radians
					O: longitudeOfAscendingNode, // Node: generated in Radians
					w: (d.pl_orblper ?? 0) * DEG_TO_RAD, // Periapsis: converted to Radians
					M: meanAnomalyAtEpoch, // Phase: Radians
					P: d.pl_orbper ?? 0, // Period: Days
					isCb: d.cb_flag === 1, // Circumbinary toggle flag
				},
			}
		},
	)
	console.log(`Got ${orbitEdges.length} orbit edges...`)
	const childEdges: AstroJSON.Neo4J.Edge.Child[] = [
		// Systems
		...systemNodes.map((systemNode) => ({
			source: systemNode.id,
			target: 'milky-way',
			type: 'in' as const,
		})),
		// Bodies
		...starNodes.map((starNode) => ({
			source: starNode.id,
			target: nameToId(starNode.data.sy_name),
			type: 'in' as const,
		})),
		...planetNodes.map((planetNode) => ({
			source: planetNode.id,
			target: nameToId(planetNode.data.sy_name),
			type: 'in' as const,
		})),
	]
	console.log(`Got ${childEdges.length} child edges...`)

	// Write outputs
	fs.writeFileSync(
		OUT_FILE_UNIVERSE_GRAPH,
		JSON.stringify(
			{
				nodes: [...planetNodes, ...starNodes, ...systemNodes],
				edges: [...orbitEdges, ...childEdges],
			},
			null,
			2,
		),
	)
	console.log('Preprocessing complete. Universe graph data saved.')
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
