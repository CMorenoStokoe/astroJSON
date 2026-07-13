import { json } from '@sveltejs/kit';

type SystemRecord = {
	id?: string;
	name?: string;
	x?: number;
	y?: number;
	z?: number;
	coords?: {
		x?: number;
		y?: number;
		z?: number;
	};
};

const normalizeSystem = (system: SystemRecord, start: string) => {
	const id = String(system.id ?? system.name ?? '').trim();
	const name = String(system.name ?? system.id ?? id).trim();
	const x = Number(system.x ?? system.coords?.x ?? 0);
	const y = Number(system.y ?? system.coords?.y ?? 0);
	const z = Number(system.z ?? system.coords?.z ?? 0);

	return {
		id,
		name,
		x: Number.isFinite(x) ? x : 0,
		y: Number.isFinite(y) ? y : 0,
		z: Number.isFinite(z) ? z : 0,
		isStart: id.toLowerCase() === start || name.toLowerCase() === start,
		type: 'system'
	};
};

export const GET = async ({ locals, url }) => {
	const start = (url.searchParams.get('start') || 'sol').toLowerCase();
	const requestedLimit = Number(url.searchParams.get('limit') ?? 900);
	const limit = Number.isFinite(requestedLimit)
		? Math.min(Math.max(Math.round(requestedLimit), 50), 2500)
		: 900;

	const result = await locals.db.run(
		`
		MATCH (start:System)
		WHERE toLower(coalesce(start.id, start.name)) = toLower($start)
		OPTIONAL MATCH (start)-[:SEES|sees*0..1]-(seen:System)
		WITH start, collect(DISTINCT seen) + [start] AS systems
		UNWIND systems AS sys
		WITH start, collect(DISTINCT {
			id: coalesce(sys.id, sys.name),
			name: coalesce(sys.name, sys.id),
			x: coalesce(sys.x, sys.coords.x, 0.0),
			y: coalesce(sys.y, sys.coords.y, 0.0),
			z: coalesce(sys.z, sys.coords.z, 0.0),
			isStart: toLower(coalesce(sys.id, sys.name)) = toLower($start),
			type: 'system'
		}) AS systems
		RETURN { id: coalesce(start.id, start.name), name: coalesce(start.name, start.id) } AS startSystem, systems
		`,
		{ start }
	);

	const row = result.records[0];
	if (!row) {
		return json(
			{
				error: `Start system not found: ${start}`
			},
			{ status: 404 }
		);
	}

	const systems = (row.get('systems') as Array<Record<string, unknown>>)
		.slice(0, limit)
		.map((system) => normalizeSystem(system as SystemRecord, start));

	return json({
		startSystem: row.get('startSystem'),
		systems,
		source: 'neo4j'
	});
};
