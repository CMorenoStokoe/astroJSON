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
import { calculateGraphNeighbours } from './lib/neo4j/calculateGraphNeighbours'
import { getNearbySystems } from './lib/renderer/getNearbySystems'
import { getVisibleNeighbourhoods } from './lib/renderer/getVisibleNeighbourhoods'

const IN_DIR = 'data/raw'
const IN_FILE_PLANET_EXO = path.join(IN_DIR, 'planets-exogenous.csv')
const IN_FILE_PLANET_ENDO = path.join(IN_DIR, 'planets-endogenous.csv')
const IN_FILE_STAR_EXO = path.join(IN_DIR, 'stars-exogenous.csv')
const IN_FILE_STAR_ENDO = path.join(IN_DIR, 'stars-endogenous.csv')
const IN_FILE_SYS_EXO = path.join(IN_DIR, 'systems-exogenous.csv')
const IN_FILE_SYS_ENDO = path.join(IN_DIR, 'systems-endogenous.csv')
const OUT_DIR = 'data/preprocess'

// Helpers
const parseNasaExoplanetArchiveCsv = (files: string[], fields: any) =>
	files.flatMap((filename) =>
		fs
			.readFileSync(filename, 'utf8')
			.split('\n')
			.slice(1)
			.map((line) =>
				Object.fromEntries(
					line
						.split(',')
						.map((value, index) => [fields[index], value]),
				),
			)
			.filter((record) =>
				Object.values(record).some((value) => value !== ''),
			) // Blank rows
			.map((record) => record as NASA.ExoplanetArchiveRecord),
	)
const writeOutFile = (filename: string, data) =>
	fs.writeFileSync(
		path.join(OUT_DIR, `${filename}.json`),
		JSON.stringify(data, null, 2),
	)

// Main
const run = async () => {
	// # Pre-process (graph data format)
	console.log('All API data fetched successfully. Ready for preprocessing.')

	// Exoplanets and their orbits
	let { planets, orbits } = parseNasaExoplanetArchiveCsv(
		[IN_FILE_PLANET_EXO, IN_FILE_PLANET_ENDO],
		MINIFIED_FIELDS,
	)
		.map(planetFromNasaExo)
		.filter((x) => x !== null)
		// Restructure to put planets and orbits into separate arrays for easier Neo4J ingestion
		.reduce(
			(acc, { planetNode, orbitEdge }) => {
				acc.planets.push(planetNode)
				acc.orbits.push(orbitEdge)
				return acc
			},
			{
				planets: [] as AstroJSON.Neo4J.Node.Planet[],
				orbits: [] as AstroJSON.Neo4J.Edge.Orbit[],
			},
		)
	console.log(`Got ${planets.length} planets and ${orbits.length} orbits...`)
	const orbitIssues = orbits.reduce((acc, orbit) => {
		for (const [key, value] of Object.entries(orbit))
			if (!value) acc[key] = (acc[key] ?? 0) + 1
		return acc
	}, {})
	console.warn(`Orbital diagnostics (n missing values):`, orbitIssues)

	// Stars
	let { starNodes, systemMembershipEdges } = parseNasaExoplanetArchiveCsv(
		[IN_FILE_STAR_EXO, IN_FILE_STAR_ENDO],
		MINIFIED_STAR_FIELDS,
	)
		.map(starFromNasaExo)
		.filter((x) => x !== null)
		.reduce(
			(acc, { starNode, systemMembershipEdge }) => {
				acc.starNodes.push(starNode)
				acc.systemMembershipEdges.push(systemMembershipEdge)
				return acc
			},
			{
				starNodes: [] as AstroJSON.Neo4J.Node.Star[],
				systemMembershipEdges: [] as AstroJSON.Neo4J.Edge.Child[],
			},
		)
	console.log(
		`Got ${starNodes.length} stars (belonging to ${systemMembershipEdges.length} systems)...`,
	)

	// Systems
	let systems = parseNasaExoplanetArchiveCsv(
		[IN_FILE_SYS_EXO, IN_FILE_SYS_ENDO],
		MINIFIED_SYSTEM_FIELDS,
	)
		.map(systemFromNasaExo)
		.filter((x) => x !== null)
	console.log(`Got ${systems.length} systems...`)

	// Dedupe bodies
	const nodeIds = new Set<string>()
	const duplicateNodeIds: string[] = []
	const dedupe = (n, type) =>
		n.filter(({ id }) => {
			const key = `${type}:${id}`
			const exists = nodeIds.has(key)
			if (exists) duplicateNodeIds.push(key)
			nodeIds.add(key)
			return !exists
		})
	starNodes = dedupe(starNodes, 'Star')
	systems = dedupe(systems, 'System')
	planets = dedupe(planets, 'Planet')
	console.warn(
		`Deduped ${duplicateNodeIds.length} duplicate nodes (incl. ${duplicateNodeIds.slice(0, 2)}..) ...`,
	)

	// Neighbourhoods
	const nearbySystems: {
		source: string
		target: string
		distance: number
	}[] = getNearbySystems(systems)
	console.log(
		`Got ${nearbySystems.length} nearby system edges [processing step]...`,
	)
	const { neighbourhoodNodes, neighbourhoodMembershipEdges } =
		calculateGraphNeighbours(systems, nearbySystems)
	console.log(
		`Got ${neighbourhoodNodes.length} neighbourhoods containing ${neighbourhoodMembershipEdges.length} systems (~${(systems.length / neighbourhoodNodes.length).toFixed(1)}/neighbourhood)...`,
	)
	const visibleNeighbourhoodEdges = getVisibleNeighbourhoods(
		neighbourhoodNodes,
		systems,
		neighbourhoodMembershipEdges,
	)
	console.log(
		`Got ${visibleNeighbourhoodEdges.length} visible system edges (~${(visibleNeighbourhoodEdges.length / neighbourhoodNodes.length).toFixed(1)}/neighbourhood)...`,
	)

	// Galaxies
	const galaxies: AstroJSON.Neo4J.Node.Galaxy[] = [
		{
			id: 'milky-way',
			type: 'galaxy',
			name: 'Milky Way', // Standardized galaxy name (e.g., 'Milky Way')
		},
	]
	const galaxyMembershipEdges: AstroJSON.Neo4J.Edge.Child[] =
		neighbourhoodNodes.map((n) => ({
			id: `${n.id}|milky-way`,
			source: n.id,
			target: 'milky-way',
			type: 'in',
		}))
	console.log(
		`Got ${galaxies.length} galaxy nodes (${galaxyMembershipEdges.length} members)...`,
	)

	// Write outputs
	writeOutFile('stars', starNodes)
	writeOutFile('systems', systems)
	writeOutFile('system-membership', systemMembershipEdges)
	writeOutFile('planets', planets)
	writeOutFile('orbits', orbits)
	writeOutFile('neighbourhoods', neighbourhoodNodes)
	writeOutFile('neighbourhood-membership', neighbourhoodMembershipEdges)
	writeOutFile('visible-systems', visibleNeighbourhoodEdges)
	writeOutFile('galaxies', galaxies)
	writeOutFile('galaxy-membership', galaxyMembershipEdges)
	console.log('Preprocessing complete. Universe graph data saved.')
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
