import neo4j from 'neo4j-driver';
import type { Handle } from '@sveltejs/kit';

// Connect to a local Neo4j instance
const driver = neo4j.driver('bolt://localhost:7687');

export const handle: Handle = async ({ event, resolve }) => {
	const session = driver.session();
	event.locals.db = session;

	try {
		return await resolve(event);
	} finally {
		// Close session to prevent leaks
		await session.close();
	}
};
