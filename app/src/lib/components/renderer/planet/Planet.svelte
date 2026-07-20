<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry } from 'three';
	import { drawOrbit } from './drawOrbit';
	import { texturePlanet } from './texturePlanet';
	import { rotatePlanet } from './rotatePlanet';
	import { writable } from 'svelte/store';
	import { animateOrbit } from './animateOrbit';
	import { getSettings } from '$lib/contexts/settings';
	import { Spring } from 'svelte/motion';
	import Label from './Label.svelte';
	let settings = getSettings();

	let {
		planet
	}: {
		planet: App.PageData['planets'][0];
	} = $props();

	// States
	let isHover = $state(false);

	// Render body rotation
	const rotation = writable<number>(0);
	useTask(
		rotatePlanet(
			rotation,
			settings.simulation.rateDaysPerSecond,
			settings.simulation.imputedAveragePlanetSpinRate
		)
	);

	// Render orbit movement
	const position = writable<[x: number, y: number, z: number]>([0, 0, 0]);
	useTask(
		animateOrbit(
			position,
			() => planet,
			() => settings.simulation.rateDaysPerSecond
		)
	);

	// Render orbit line
	const orbitLine = $derived(
		new BufferGeometry().setFromPoints(drawOrbit(planet, settings.quality.orbitSegments))
	);

	// Render planet size
	const radius = $derived(planet.radius * 4.2635e-5); // Earth radii to AU units in renderspace

	// Highlight on hover
	const baseScale = $derived(settings.appearance.scalePlanetSize);
	const scale = new Spring(1);
	const renderedRadius = $derived(radius * scale.current);
	const labelOffset = $derived(0.55 + Math.min(renderedRadius * 0.35, 1.25));
	const labelFontSize = $derived(Math.max(Math.min(renderedRadius * 0.2, 0.45), 0.18));
	$effect(() => {
		scale.set(isHover ? baseScale * 1.5 : baseScale);
	});
	const handleHover = (isHovering: boolean) => {
		isHover = isHovering;
	};
</script>

<!-- Planet -->
<T.Mesh
	rotation.y={$rotation}
	position={$position}
	scale={scale.current}
	onpointerenter={() => handleHover(true)}
	onpointermove={() => handleHover(true)}
	onpointerleave={() => handleHover(false)}
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

<!-- Label -->
{#if isHover}
	<Label {planet} position={$position} {labelOffset} fontSize={labelFontSize} />
{/if}
