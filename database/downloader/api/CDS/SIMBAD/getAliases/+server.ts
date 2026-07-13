import type { RequestHandler } from './$types';

type result = {
	metadata: [
		{
			name: 'main_id';
			description: 'Main identifier for an object';
			datatype: 'CHAR';
			arraysize: '*';
			ucd: 'meta.id;meta.main';
			utype: 'mango:MangoObject.identifier';
		},
		{
			name: 'id';
			description: 'Identifier';
			datatype: 'CHAR';
			arraysize: '*';
			ucd: 'meta.id';
		}
	];
	data: [
		['Kepler-186', 'TIC 268159861']
		// [alias, database] ...
	];
};

export const GET: RequestHandler = async () => {
	const url =
		'https://simbad.u-strasbg.fr/simbad/sim-tap/sync?REQUEST=doQuery&LANG=ADQL&FORMAT=json&QUERY=SELECT+basic.main_id%2C+ident.id+FROM+basic+JOIN+ident+ON+basic.oid+%3D+ident.oidref+WHERE+basic.main_id+%3D+%27Kepler-186%27';

	return new Response();
};
