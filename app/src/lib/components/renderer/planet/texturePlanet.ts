// Returns threlte texture for a planet
export const texturePlanet = (planet: AstroJSON.Renderer.Planet) => {
	// Texture planet
	const colorPlanet = () => {
		//  "Mercurian" | "Terrestrial" | "Super-Earth" | "Ocean World" | "Mega-Earth" | "Mini-Neptune" | "Neptunian" | "Jovian" | "Super-Puff" | "Super-Jovian" | "Unknown"
		switch (planet.classification) {
			case 'Mercurian':
				return '#b1b1b1';
			case 'Terrestrial':
				return '#a0522d';
			case 'Super-Earth':
				return '#8b0000';
			case 'Ocean World':
				return '#1e90ff';
			case 'Mega-Earth':
				return '#2f4f4f';
			case 'Mini-Neptune':
				return '#4682b4';
			case 'Neptunian':
				return '#5f9ea0';
			case 'Jovian':
				return '#daa520';
			case 'Super-Puff':
				return '#ff69b4';
			case 'Super-Jovian':
				return '#ff4500';
			default:
				return '#808080'; // Unknown
		}
	};

	return { color: colorPlanet() };
};
