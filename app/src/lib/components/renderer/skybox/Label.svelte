<script lang="ts">
	import { T } from '@threlte/core';
	import { Billboard, Text } from '@threlte/extras';
	import { DoubleSide } from 'three';
	import { getSettings } from '$lib/contexts/settings';
	let settings = getSettings();

	let {
		position,
		system
	}: {
		position: [number, number, number];
		system: AstroJSON.Renderer.VisibleSystemInSky;
	} = $props();

	// Helpers
	const apparentBrightnessInSols = 10 ** (-0.4 * (system.brightness - 4.83));

	// Properties
	const markerScale = settings.appearance.skyboxDistance * 0.035;
	const labelOffset = settings.appearance.skyboxDistance * 0.055;
	const fontSize = settings.appearance.skyboxDistance * 0.04; // 0.025;
	const displayFont = '/fonts/Offside-Regular.ttf';
	const bodyFont = '/fonts/Roboto-VariableFont_wdth,wght.ttf';

	// Ring appearance
	const ring = [0.9, 1, 64];
	const markerColor = '#7d66ff';
	const ringArc = (3 * Math.PI) / 2; // Form ring anti-clock-wise until 3pm
	const ringRotation = Math.PI * 0.12;
	const ringStart = Math.PI / 2; // 12 o'clock

	// Protruding line appearance
	const lineLength = markerScale * 0.9;
	const lineThickness = markerScale * 0.08;
	const lineX = markerScale + lineLength / 2; // start from 3 o'clock and extend right
</script>

<Billboard {position}>
	<!-- Marker -->
	<T.Mesh scale={markerScale} rotation={[0, 0, ringRotation]}>
		<T.RingGeometry args={[ring[0], ring[1], ring[2], 1, ringStart, ringArc]} />
		<T.MeshBasicMaterial
			color={markerColor}
			depthWrite={false}
			depthTest={false}
			toneMapped={false}
			side={DoubleSide}
		/>
	</T.Mesh>

	<!-- Protruding line from 3 o'clock -->
	<T.Mesh position={[lineX, 0, 0]}>
		<T.PlaneGeometry args={[lineLength, lineThickness]} />
		<T.MeshBasicMaterial
			color={markerColor}
			depthWrite={false}
			depthTest={false}
			toneMapped={false}
			side={DoubleSide}
		/>
	</T.Mesh>

	<!-- System name -->
	<Text
		text={system.name.toUpperCase()}
		font={displayFont}
		position={[labelOffset * 0.2, labelOffset * 0.2, 0]}
		{fontSize}
		color={markerColor}
		anchorX="left"
		anchorY="bottom"
		textAlign="left"
		letterSpacing={0.03}
		depthOffset={-1}
	/>

	<!-- Distance -->
	<Text
		text={`${Math.round(system.viewpoint.distance).toLocaleString()} parsecs`}
		position={[labelOffset * 0.8, -labelOffset * 0.2, 0]}
		font={bodyFont}
		fontSize={fontSize * 0.8}
		color={markerColor}
		anchorX="left"
		anchorY="top"
		textAlign="left"
		letterSpacing={0.03}
		depthOffset={-1}
	/>

	<!-- -->
	<Text
		text={'Lux: ' + apparentBrightnessInSols.toFixed(1) + ' sols'}
		position={[labelOffset * 0.8, -labelOffset * 0.9, 0]}
		font={bodyFont}
		fontSize={fontSize * 0.65}
		color={markerColor}
		anchorX="left"
		anchorY="top"
		textAlign="left"
		letterSpacing={0.03}
		depthOffset={-1}
	/>
</Billboard>
