/**
 * Standard GeoJSON Specification (RFC 7946)
 * @description Used for reference for developing AstroJSON schema
 */

// A position is an array of numbers: [longitude, latitude, elevation/altitude?]
export type Position = number[];

// Bounding box: [west, south, east, north] or [west, south, bottom, east, north, top]
export type BBox =
	| [number, number, number, number]
	| [number, number, number, number, number, number];

export type GeoJsonGeometryTypes =
	| 'Point'
	| 'MultiPoint'
	| 'LineString'
	| 'MultiLineString'
	| 'Polygon'
	| 'MultiPolygon'
	| 'GeometryCollection';

export type GeoJsonTypes = GeoJsonGeometryTypes | 'Feature' | 'FeatureCollection';

export interface GeoJsonObject {
	type: GeoJsonTypes;
	bbox?: BBox;
}

// --- Geometries ---

export interface Point extends GeoJsonObject {
	type: 'Point';
	coordinates: Position;
}

export interface MultiPoint extends GeoJsonObject {
	type: 'MultiPoint';
	coordinates: Position[];
}

export interface LineString extends GeoJsonObject {
	type: 'LineString';
	coordinates: Position[];
}

export interface MultiLineString extends GeoJsonObject {
	type: 'MultiLineString';
	coordinates: Position[][];
}

export interface Polygon extends GeoJsonObject {
	type: 'Polygon';
	// The first array represents the outer boundary (LinearRing).
	// Any subsequent arrays represent holes within that boundary.
	coordinates: Position[][];
}

export interface MultiPolygon extends GeoJsonObject {
	type: 'MultiPolygon';
	coordinates: Position[][][];
}

export type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

export interface GeometryCollection extends GeoJsonObject {
	type: 'GeometryCollection';
	geometries: Geometry[];
}

// --- Features ---

export interface GeoJsonProperties {
	[name: string]: any;
}

export interface Feature<
	G extends Geometry | GeometryCollection | null = Geometry,
	P = GeoJsonProperties | null
> extends GeoJsonObject {
	type: 'Feature';
	geometry: G;
	properties: P;
	id?: string | number;
}

// --- Feature Collection ---

export interface FeatureCollection<
	G extends Geometry | GeometryCollection | null = Geometry,
	P = GeoJsonProperties | null
> extends GeoJsonObject {
	type: 'FeatureCollection';
	features: Feature<G, P>[];
}

// Root union type encompassing all valid GeoJSON objects
export type GeoJSON = Geometry | GeometryCollection | Feature | FeatureCollection;
