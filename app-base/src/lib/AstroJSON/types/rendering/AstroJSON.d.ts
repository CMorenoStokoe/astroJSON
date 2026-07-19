/**
 * # AstroJSON Specification
 * @description Expands the GeoJSON schema for mapping space on galactic scale
 * @link [AstroJSON Specification](https://docs.google.com/document/d/11OqeKQU0gmc242bD7i5V-Bf993U-6mxntT8l54IAJzs/edit?usp=sharing)
 * @link [GeoJSON Specification](https://datatracker.ietf.org/doc/html/rfc7946)
 */
export namespace AstroJSON {
	/**
	 * Position
	 * @description The position of a celestial object in 3D space represented with Galactic Coordinates.
	 * Uses the units: (l, b, d) in degrees and parsecs (Kiloparsecs, kpc).
	 * @see GeoJSON.Position - Differs in coordinate system and that the third coordinate parameter is required not optional
	 * @link [Galactic Coordinate System (IAU, 1958)](https://ui.adsabs.harvard.edu/abs/1960MNRAS.121..123B/abstract)
	 */
	type Position = [number, number, number]; // [l, b, d]

	/**
	 * Bounding Box
	 * @description The bounding box which entirely contains the celestial object in galactic [west, south, bottom, east, north, top]
	 * @see GeoJSON.BBox - Differs in coordinate system and that coordinates must be specified in 3D space (i.e., 6 components not 4)
	 */
	type BBox = [number, number, number, number, number, number];

	/**
	 * Geometry Types
	 * @description GeoJSON-like geometry types for celestial objects in galactic space, for specifying the shape and location of celestial objects in 3D space
	 * @see GeoJSON.GeometryTypes - Geometry type names are the same (but see each individual definition is different e.g., use galactic coordinate system)
	 */
	type GeometryTypes =
		| 'Point'
		| 'MultiPoint'
		| 'LineString'
		| 'MultiLineString'
		| 'Polygon'
		| 'MultiPolygon'
		| 'GeometryCollection';

	/**
	 * Types
	 * @description Top-level GeoJSON-like types used to specify the payload at a high-level (i.e., is it one object, or many?)
	 * @see GeoJSON.Types - High-level specification of geometries is the same as in GeoJSON
	 */

	type Types = GeometryTypes | 'Feature' | 'FeatureCollection';

	/**
	 * Object
	 * @description Base interface for all GeoJSON-like objects, including geometries, features, and feature collections
	 * @see GeoJSON.Object - Base interface is the same as in GeoJSON
	 */
	interface Object {
		type: Types;
		bbox?: BBox;
	}

	// --- Geometries ---

	/**
	 * Point
	 * @description A single point in 3D galactic space, represented with Galactic Coordinates (l, b, d) in degrees and parsecs.
	 * @see GeoJSON.Point - Differs in Position definition
	 */

	interface Point extends Object {
		type: 'Point';
		coordinates: Position;
	}

	/**
	 * MultiPoint
	 * @description A collection of points in 3D galactic space, represented with Galactic Coordinates (l, b, d) in degrees and parsecs.
	 * @see GeoJSON.MultiPoint - Differs in Position definition
	 */

	interface MultiPoint extends Object {
		type: 'MultiPoint';
		coordinates: Position[];
	}

	/**
	 * LineString
	 * @description A line in 3D galactic space, represented with Galactic Coordinates (l, b, d) in degrees and parsecs.
	 * @see GeoJSON.LineString - Differs in Position definition
	 */

	interface LineString extends Object {
		type: 'LineString';
		coordinates: Position[];
	}

	/**
	 * MultiLineString
	 * @description A collection of lines in 3D galactic space, represented with Galactic Coordinates (l, b, d) in degrees and parsecs.
	 * @see GeoJSON.MultiLineString - Differs in Position definition
	 */

	interface MultiLineString extends Object {
		type: 'MultiLineString';
		coordinates: Position[][];
	}

	/**
	 * Polygon
	 * @description A polygon in 3D galactic space, represented with Galactic Coordinates (l, b, d) in degrees and parsecs.
	 * @see GeoJSON.Polygon - Differs in Position definition
	 */

	interface Polygon extends Object {
		type: 'Polygon';
		// The first array represents the outer boundary (LinearRing).
		// Any subsequent arrays represent holes within that boundary.
		coordinates: Position[][];
	}

	/**
	 * MultiPolygon
	 * @description A collection of polygons in 3D galactic space, represented with Galactic Coordinates (l, b, d) in degrees and parsecs.
	 * @see GeoJSON.MultiPolygon - Differs in Position definition
	 */

	interface MultiPolygon extends Object {
		type: 'MultiPolygon';
		coordinates: Position[][][];
	}

	/**
	 * Geometry
	 * @description Union type for all valid GeoJSON-like geometries in 3D galactic space
	 * @see GeoJSON.Geometry - Union type is the same as in GeoJSON
	 */

	type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

	/**
	 * GeometryCollection
	 * @description A collection of geometries in 3D galactic space, used to represent complex shapes and structures in the galaxy.
	 * @see GeoJSON.GeometryCollection - Collection type is the same as in GeoJSON
	 */

	interface GeometryCollection extends Object {
		type: 'GeometryCollection';
		geometries: Geometry[];
	}

	// --- Features ---

	/**
	 * Properties
	 * @description A free-form set of key-value pairs that describe the properties of a celestial object in 3D galactic space.
	 * @see GeoJSON.Properties - The optional and informally used M property in GeoJSON is now required in AstroJSON to specify the reference time (epoch) for the celestial object.
	 */
	interface Properties {
		[name: string]: any;
		M: // Reference time
			| 'J2000' // Standard epoch for celestial coordinates (Julian year 2000.0)
			| 'B1950' // Historical epoch for celestial coordinates (Besselian year 1950.0)
			| `${number}-${number}-${number}T${number}:${number}:${number}Z`; // Any other time in ISO 8601 strings formatted as 'YYYY-MM-DDTHH:mm:ssZ'
	}

	/**
	 * Feature
	 * @description A high-level definition of a body in space, represented with a geometry and a set of properties.
	 * @see GeoJSON.Feature - Feature type is the same as in GeoJSON
	 */

	interface Feature<
		G extends Geometry | GeometryCollection | null = Geometry,
		P = Properties | null
	> extends Object {
		type: 'Feature';
		geometry: G;
		properties: P;
		id?: string | number;
	}

	// --- Feature Collection ---
	/**
	 * FeatureCollection
	 * @description A collection of features in 3D galactic space, used to represent complex structures and systems in the galaxy.
	 * @see GeoJSON.FeatureCollection - Collection type is the same as in GeoJSON
	 */
	interface FeatureCollection<
		G extends Geometry | GeometryCollection | null = Geometry,
		P = Properties | null
	> extends Object {
		type: 'FeatureCollection';
		features: Feature<G, P>[];
	}

	/**
	 * AstroJSON (root union)
	 * @description Root union type encompassing all valid GeoJSON-like objects in 3D galactic space, used to represent celestial objects and structures in the galaxy.
	 * @see GeoJSON - Root union type is the same as in GeoJSON
	 */

	type AstroJSONObject = Geometry | GeometryCollection | Feature | FeatureCollection;

	/**
	 * AstroJSON Kit
	 * @description Expansion types to represent all celestial objects and structures in the galaxy using AstroJSON.
	 */
	namespace Kit {
		/**
		 * Features
		 * @description Expansion types to represent celestial objects and structures including orbital paths, spherical bodies, and volumetric bodies.
		 */
		namespace Features {
			// See definitions in `./features/*.d.ts`
		}
	}
}
