import { AstroJSON } from '../AstroJSON';
import { OrbitPath } from './OrbitPath';
import { SphericalBody } from './SphericalBody';
import { VolumetricBody } from './VolumetricBody';
import { SphericalBodyWithOrbit } from './SphericalBodyWithOrbit';

/**
 * # System feature set
 * @description Interface representing a set of features in a system, including stars, planets, moons, and other celestial objects.
 */

namespace AstroJSON.Feature {
	interface SystemFeatureSet extends AstroJSON.FeatureCollection {
		type: 'FeatureCollection';
		features: Array<OrbitPath | SphericalBody | VolumetricBody | SphericalBodyWithOrbit>; // Array of features representing celestial objects and their orbits
	}
}
