import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';

const BASE_URL = 'https://ssd-api.jpl.nasa.gov/horizons.api';
const EPOCH_J2000 = '2451545.0'; // Standard J2000 Epoch (2000-Jan-01 12:00:00 TT)

// Get the solar system data from NASA's Horizons API
export const GET: RequestHandler = async ({ request }) => {
	// Get planet name from query parameters
	const planet = new URL(request.url).searchParams.get('planet') ?? '';

	// Query database for info on planet
	const params = new URLSearchParams({
		format: 'json',
		COMMAND: `'${planet}'`,
		EPHEM_TYPE: "'ELEMENTS'",
		CENTER: "'@10'", // Sun
		TLIST: `'${EPOCH_J2000}'`, // Lock to J2000
		OBJ_DATA: "'NO'",
		CSV_FORMAT: "'YES'"
	});

	const res = await fetch(`${BASE_URL}?${params.toString()}`);
	const data = await res.json();

	const ephemBlock = data.result.split('$$SOE')[1].split('$$EOE')[0];
	const elements = ephemBlock.trim().split(',');

	const planetData = {
		pl_name: 'ADD: p.name',
		hostname: 'Sun',
		discoverymethod: 'N/A',
		sy_pnum: 8,
		sy_dist: 0.0,
		ra: 0.0,
		dec: 0.0,
		pl_masse: 'ADD: p.masse',
		pl_rade: 'ADD: p.rade',
		pl_dens: 'ADD: p.dens',
		// Parsed from Horizons J2000 output
		pl_orbper: parseFloat(elements[13]), // PR: Sidereal orbit period
		pl_orbsmax: parseFloat(elements[11]), // A: Semi-major axis
		pl_orbeccen: parseFloat(elements[2]), // EC: Eccentricity
		pl_orbincl: parseFloat(elements[4]), // IN: Inclination
		pl_eqt: 'ADD: p.eqt',
		pl_insol: 'ADD: p.insol',
		st_mass: 1.0,
		st_rad: 1.0,
		st_teff: 5778.0
	};

	return json(planetData);
};
