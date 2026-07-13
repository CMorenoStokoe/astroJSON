// Creates a skybox for all non-visualised stars which won't move even if we zoom in/out, move or even select an adjacent system
export const preRenderSkybox = (
	stars: AstroJSON.Neo4J.Node.Star[],
): {
	starPositions: { x: number; y: number; z: number }[]
} => {
	// Pre-render the skybox for all stars
	const starPositions = stars.map((star) => star.coords)
	return { starPositions }
}
