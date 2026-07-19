<script lang="ts">
	import { T } from '@threlte/core';
	import { textureStar } from './textureStar';
	import { calculateStarIntensity } from './calculateStarIntensity';
	import { SCALE_STAR_SIZE } from '$lib/config/settings';
	let {
		star,
		position = [0, 0, 0]
	}: {
		star: App.PageData['stars'][number];
		position?: [x: number, y: number, z: number];
	} = $props();

	// Render star color
	const color = textureStar(star).color;

	// Render star luminosity
	const intensity = calculateStarIntensity(star.luminosity);
	const [distance, decay] = [0, 1]; // No cutoff, linear decay

	// Render star size
	const radius = star.radius * 0.00465047; // Solar radii to AU units in renderspace
</script>

<!-- Stellar body -->
<T.Mesh {position} scale={SCALE_STAR_SIZE}>
	<T.SphereGeometry args={[radius, 32, 32]} />
	<T.MeshBasicMaterial {color} />
</T.Mesh>

<!-- Stellar light -->
<T.PointLight {color} {position} {intensity} {distance} {decay} castShadow />
