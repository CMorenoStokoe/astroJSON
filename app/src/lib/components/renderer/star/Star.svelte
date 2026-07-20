<script lang="ts">
	import { T } from '@threlte/core';
	import { Spring } from 'svelte/motion';
	import Label from './Label.svelte';
	import { getSettings } from '$lib/contexts/settings';
	import { accurateColorStar } from '../common/accurateColorStars';
	let settings = getSettings();

	let {
		star,
		position
	}: {
		star: App.PageData['stars'][number];
		position: [x: number, y: number, z: number];
	} = $props();

	// States
	let isHover = $state(false);

	// Render star color
	const color = $derived(accurateColorStar(star));

	// Render star luminosity
	const intensity = $derived(
		settings.appearance.localStarIntensityMultiplier * 0.1 * 10 ** star.luminosity
	);
	const [distance, decay] = [0, 2]; // No cutoff, inverse-square falloff

	// Render star size
	const radius = $derived(star.radius * 0.00465047); // Solar radii to AU units in renderspace

	// Highlight on hover
	const baseScale = $derived(settings.appearance.scaleStarSize);
	const scale = new Spring(1);
	const renderedRadius = $derived(radius * scale.current);
	const labelOffset = $derived(0.85 + Math.min(renderedRadius * 0.18, 2));
	const labelFontSize = $derived(Math.max(Math.min(renderedRadius * 0.04, 0.45), 0.18));
	$effect(() => {
		scale.set(isHover ? baseScale * 1.5 : baseScale);
	});
	const handleHover = (isHovering: boolean) => {
		isHover = isHovering;
	};
</script>

<!-- Stellar body -->
<T.Mesh
	{position}
	scale={scale.current}
	onpointerenter={() => handleHover(true)}
	onpointermove={() => handleHover(true)}
	onpointerleave={() => handleHover(false)}
>
	<T.SphereGeometry args={[radius, 32, 32]} />
	<T.MeshBasicMaterial {color} toneMapped={false} />
</T.Mesh>

<!-- Stellar light -->
<T.PointLight {color} {position} {intensity} {distance} {decay} castShadow />

<!-- Label -->
{#if isHover}
	<Label {star} {position} {labelOffset} fontSize={labelFontSize} />
{/if}
