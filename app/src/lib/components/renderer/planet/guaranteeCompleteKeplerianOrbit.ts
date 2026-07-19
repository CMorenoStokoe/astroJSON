// Returns a safe and guaranteed complete set of Keplerian orbital elements for a given  filling in any missing values with defaults
export const guaranteeCompleteKeplerianOrbit = (
	orbit?: App.PageData['planets'][number]['orbit']
): Required<AstroJSON.Schema.KeplerianOrbitalElements> => ({
	// Guard against any falsey value (particularly we will see "") and values of 0 would also be invalid
	a: orbit?.a ? Number(orbit.a) : 1, // 1 AU default
	e: orbit?.e ? Number(orbit.e) : 0, // 0 eccentricity default
	i: orbit?.i ? Number(orbit.i) : 0, // 0 inclination default
	w: orbit?.w ? Number(orbit.w) : 0, // 0 argument of periapsis default
	M: orbit?.M ? Number(orbit.M) : 0, // 0 mean anomaly default
	P: orbit?.P ? Number(orbit.P) : 365 // 365 day orbital period default
});
