<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry } from 'three';
	import { drawOrbit } from './drawOrbit';
	import { texturePlanet } from './texturePlanet';
	import { rotatePlanet } from './rotatePlanet';
	import { writable } from 'svelte/store';
	import { animateOrbit } from './animateOrbit';
	import { SCALE_PLANET_SIZE } from '$lib/config/settings';

	let {
		planet
	}: {
		planet: App.PageData['planets'][0];
	} = $props();

	// Render body rotation
	const rotation = writable<number>(0);
	useTask(rotatePlanet(rotation));

	// Render orbit movement
	const position = writable<[x: number, y: number, z: number]>([0, 0, 0]);
	useTask(animateOrbit(position, planet));

	// Render orbit line
	const orbitLine = new BufferGeometry().setFromPoints(drawOrbit(planet));

	// Render planet size
	const radius = planet.radius * 4.2635e-5; // Earth radii to AU units in renderspace
</script>

<!-- Planet -->
<T.Mesh
	rotation.y={$rotation}
	position={$position}
	scale={SCALE_PLANET_SIZE}
	castShadow
	receiveShadow
>
	<T.SphereGeometry args={[radius, 32, 32]} />
	<T.MeshStandardMaterial color={texturePlanet(planet).color} roughness={0.8} metalness={0} />
</T.Mesh>

<!-- Orbit line -->
<T.LineLoop geometry={orbitLine}>
	<T.LineBasicMaterial color="#5539CC" />
</T.LineLoop>
