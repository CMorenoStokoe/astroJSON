import neo4j from 'neo4j-driver';
import type { Handle } from '@sveltejs/kit';
import { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } from '$env/static/private';

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

export const handle: Handle = async ({ event, resolve }) => {
	const session = driver.session();
	event.locals.db = session;

	try {
		return await resolve(event);
	} finally {
		await session.close();
	}
};
