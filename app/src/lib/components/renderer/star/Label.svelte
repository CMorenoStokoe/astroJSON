<script lang="ts">
	import { Billboard, Text } from '@threlte/extras';

	let {
		star,
		position,
		labelOffset,
		fontSize
	}: {
		star: AstroJSON.Renderer.Star;
		position: [number, number, number];
		labelOffset: number;
		fontSize: number;
	} = $props();

	// Helpers
	const name = $derived(star.name);
	const temperature = $derived(`${star.temperature.toFixed(0)} K`);
	const brightnessInSols = $derived(
		star.luminosity === 0 ? 1 : 10 ** (-0.4 * (star.luminosity - 4.83))
	);

	// Properties
	const displayFont = '/fonts/Offside-Regular.ttf';
	const bodyFont = '/fonts/Roboto-VariableFont_wdth,wght.ttf';

	// Ring appearance
	const markerColor = '#7d66ff';
</script>

<Billboard {position}>
	<!-- Star name -->
	<Text
		text={name}
		font={displayFont}
		fontWeight={600}
		position={[0, labelOffset, 0]}
		{fontSize}
		color={markerColor}
		anchorX="center"
		anchorY="bottom"
		textAlign="center"
		letterSpacing={0.03}
		depthOffset={-1}
	/>

	<!-- Temperature -->
	<Text
		text={temperature}
		position={[0, labelOffset - fontSize * 0.2, 0]}
		font={bodyFont}
		fontSize={fontSize * 0.65}
		color={markerColor}
		anchorX="center"
		anchorY="top"
		textAlign="center"
		depthOffset={-1}
	/>

	<!-- Luminsity -->
	<Text
		text={`Lux: ${brightnessInSols.toFixed(2)} sols`}
		position={[0, labelOffset - fontSize * 0.9, 0]}
		font={bodyFont}
		fontSize={fontSize * 0.55}
		color={markerColor}
		anchorX="center"
		anchorY="top"
		textAlign="center"
		depthOffset={-1}
	/>
</Billboard>
