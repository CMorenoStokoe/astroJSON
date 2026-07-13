import { AstroJSON } from '../../../../types/AstroJSON'
import { NASA } from '../../../../types/NASA'

// Classifies a planet based on its properties and returns a string representing the planet type
export const classifyPlanetType = (
	rade: number | null | undefined, // Radius in earth masses
	dens: number | null | undefined, // Density in g/cm³
): AstroJSON.Schema.Planet['classification'] => {
	if (!rade || !dens) return 'Unknown'

	// SMALL PLANETS (< 2.0 Earth Radii)
	// The "Fulton Gap" at ~1.5 - 2.0 radii separates rock from gas
	if (rade < 2.0) {
		if (dens >= 7.0) return 'Mercurian'
		// 3.3 g/cm³ is the dividing line between rock and water/ice
		if (dens >= 3.3) return rade < 1.25 ? 'Terrestrial' : 'Super-Earth'
		return 'Ocean World'
	}

	// MEDIUM PLANETS (2.0 to 6.0 Earth Radii)
	if (rade >= 2.0 && rade < 6.0) {
		// Anything this large should be gas. If it's dense rock, it's an anomaly.
		if (dens >= 5.0) return 'Mega-Earth'
		if (dens >= 1.0) return 'Neptunian' // Standard Ice Giant density (Neptune is 1.64)
		return 'Mini-Neptune' // Lighter density = thicker Hydrogen/Helium envelope
	}

	// GIANT PLANETS (>= 6.0 Earth Radii)
	if (rade >= 6.0) {
		if (dens < 0.1) return 'Super-Puff' // Escaping gas / heavily expanded
		if (dens <= 2.0) return 'Jovian' // Standard gas giants (Jupiter is 1.33)
		return 'Super-Jovian' // Highly compressed gas / Brown Dwarf transition
	}

	return 'Unknown'
}
