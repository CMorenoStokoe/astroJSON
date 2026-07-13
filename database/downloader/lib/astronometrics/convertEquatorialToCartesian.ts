// Converts equatorial coordinates to Cartesian coordinates
export const convertEquatorialToCartesian = (
	dist: number,
	ra: number,
	dec: number,
): {
	x: number
	y: number
	z: number
} => {
	// Convert from degrees to radians for js Math
	const raRad = ra * (Math.PI / 180)
	const decRad = dec * (Math.PI / 180)

	// Derive cartesian xyz coordinates (in pc)
	const galacticCoords = {
		x: dist * Math.cos(decRad) * Math.cos(raRad), // RA 0°, Dec 0°
		y: dist * Math.cos(decRad) * Math.sin(raRad), // RA 90°, Dec 0°
		z: dist * Math.sin(decRad), // north celestial pole (right-handed)
	}

	// Rotate coords to a standardised render space coordinate system
	// Note: Galactic coords look down on the galaxy from above (x=left-right, y=up/down, z=towards/back on galactic plane)
	const renderSpaceCoords = {
		x: galacticCoords.x, // Galactic x axis is already aligned to left/right
		y: galacticCoords.z, // Galactic y axis is aligned to forwards/backwards in the depth of the galaxy
		z: -galacticCoords.y, // Galactic z axis  is the y up/down axis (Three.js is also right-handed)
	}

	return renderSpaceCoords
}
