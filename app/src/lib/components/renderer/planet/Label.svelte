<script lang="ts">
	import { Billboard, Text } from '@threlte/extras';

	let {
		planet,
		position,
		labelOffset,
		fontSize
	}: {
		planet: AstroJSON.Renderer.Planet;
		position: [number, number, number];
		labelOffset: number;
		fontSize: number;
	} = $props();

	// Properties
	const displayFont = '/fonts/Offside-Regular.ttf';
	const bodyFont = '/fonts/Roboto-VariableFont_wdth,wght.ttf';

	// Ring appearance
	const markerColor = '#7d66ff';

	// Planet fact
	const name = $derived(planet.name);
	const classification = $derived(planet.classification);
	const fact = $derived.by(() => {
		if (planet.discoveryDate) return `Discovered: ${planet.discoveryDate}`;
		if (planet.orbit.P) return `Orbital Period: ${Number(planet.orbit.P).toFixed(0)} days`;
		if (planet.temperature) return `Temperature: ${planet.temperature.toFixed(0)} K`;
		return planet.hasAtmosphere ? 'Has Atmosphere' : 'No Atmosphere';
	});
</script>

<Billboard {position}>
	<!-- Planet name -->
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

	<!-- Type -->
	<Text
		text={classification}
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
		text={fact}
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
