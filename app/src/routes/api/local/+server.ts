import { json } from '@sveltejs/kit';
import systems from './systems.json';
import stars from './stars.json';
import planets from './planets.json';
import orbits from './orbits.json';
import systemMemberships from './system-membership.json';
import neighbourhoods from './neighbourhoods.json';
import neighbourhoodMemberships from './neighbourhood-membership.json';
import visibleSystems from './visible-systems.json';

const visibleSystemEdges = visibleSystems as AstroJSON.Neo4J.Edge.Sees[];

// Pre-compiled maps to search with constant time complexity
const systemsMap = new Map(systems.map((system) => [system.id, system]));
const starsMap = new Map(stars.map((star) => [star.id, star]));
const planetsMap = new Map(planets.map((planet) => [planet.id, planet]));
const neighbourhoodMap = new Map(neighbourhoods.map((n) => [n.id, n]));

// Pre-compiled maps to search with constant time complexity
const planetsBySystemMap = new Map<string, AstroJSON.Renderer.Planet[]>();
for (const orbit of orbits) {
	const planet = planetsMap.get(orbit.source);
	if (!planetsBySystemMap.has(orbit.target)) {
		planetsBySystemMap.set(orbit.target, [{ ...planet, orbit }]);
	} else planetsBySystemMap.get(orbit.target)!.push({ ...planet, orbit });
}
const starsBySystemMap = new Map();
for (const systemMembership of systemMemberships) {
	const star = starsMap.get(systemMembership.source);
	if (!starsBySystemMap.has(systemMembership.target)) {
		starsBySystemMap.set(systemMembership.target, [star]);
	} else starsBySystemMap.get(systemMembership.target)!.push(star);
}
const neighbourhoodBySystemMap = new Map(
	neighbourhoodMemberships.map((membership) => [membership.source, membership.target])
);
const visibleSystemsBySystemMap = new Map<string, AstroJSON.Renderer.VisibleSystemInSky[]>();
for (const visibleSystem of visibleSystemEdges) {
	const system = systemsMap.get(visibleSystem.target);
	const neighbourhood = neighbourhoodMap.get(visibleSystem.source);
	if (!system || !neighbourhood) continue;

	const visibleSystemInSky: AstroJSON.Renderer.VisibleSystemInSky = {
		name: system.name,
		brightness: system.brightness ?? 0,
		color: system.color,
		hasDebrisDisk: system.hasDebrisDisk,
		viewpoint: {
			distance: visibleSystem.distance,
			direction: visibleSystem.direction,
			apparentBrightness: visibleSystem.apparentBrightness
		}
	};

	if (!visibleSystemsBySystemMap.has(neighbourhood.id)) {
		visibleSystemsBySystemMap.set(neighbourhood.id, [visibleSystemInSky]);
	} else visibleSystemsBySystemMap.get(neighbourhood.id)!.push(visibleSystemInSky);
}

// Returns subgraph of systems visible from a given system
export const POST = async ({ request }) => {
	console.log('POST request received for /api/local');
	const { systemName } = await request.json();

	// Get local system
	const localBodies = {
		system: systemsMap.get(systemName),
		stars: starsBySystemMap.get(systemName),
		planets: starsBySystemMap.get(systemName).flatMap((star) => planetsBySystemMap.get(star.id))
	};

	// Get neighbourhood
	const neighbourhoodId = neighbourhoodBySystemMap.get(systemName);

	// Get distant bodies system children
	const visibleSystemsInSky = neighbourhoodId
		? (visibleSystemsBySystemMap.get(neighbourhoodId) ?? [])
		: [];

	console.log(`Local bodies for system ${systemName}:
	systems: ${localBodies.system ? 1 : 0}
	stars: ${localBodies.stars?.length || 0}
	neighbourhood: ${neighbourhoodId ? 1 : 0}
	planets: ${localBodies.planets?.length || 0}
	Visible systems: ${visibleSystemsInSky?.length || 0}
		`);

	return json({
		...localBodies,
		visibleSystems: visibleSystemsInSky
	});
};
