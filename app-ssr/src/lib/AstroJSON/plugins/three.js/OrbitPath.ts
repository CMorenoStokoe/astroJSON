import { Vector3 } from 'three';

// The orbit of a celestial body modelled for three.js using AstroJSON format data
export const Orbit = ({ geometry }: AstroJSON.Feature.OrbitPath): Vector3 =>
	// Represent each line in the orbit as a three line
	geometry.coordinates.map(([x, y, z]) => new Vector3(x, y, z));
