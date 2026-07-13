import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	// A minimal query fetching stars and the planets that orbit them
	const cypher = `
		MATCH (s:Star)<-[:ORBITS]-(p:Planet)
		RETURN s.name AS star, collect(p.name) AS planets
	`;

	try {
		const result = await locals.db.run(cypher);

		const data = result.records.map((record) => ({
			star: record.get('star'),
			planets: record.get('planets')
		}));

		return json(data);
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to fetch universe data' }, { status: 500 });
	}
};
