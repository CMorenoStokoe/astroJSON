<script lang="ts">
	import { T } from '@threlte/core';
	import { interactivity, OrbitControls } from '@threlte/extras';
	import Planet from './planet/Planet.svelte';
	import Star from './star/Star.svelte';
	import VisibleSystemsSkybox from './skybox/VisibleSystemsSkybox.svelte';
	import { getSettings } from '$lib/contexts/settings';
	import { spaceOutMultiStarSystem } from './common/spaceOutMultiStarSystem';
	let settings = getSettings();
	interactivity();

	let {
		pageData,
		handleLoadSystem
	}: { pageData: App.PageData; handleLoadSystem: (systemId: string) => void } = $props();

	// Handlers
	const handleVisibleSystemClick = (system: App.PageData['visibleSystems'][number]) =>
		handleLoadSystem(system.name);

	// Calculate renderspace star radii
	const radii = $derived(pageData.stars.map(({ radius }) => (radius ?? 1) * 0.00465047));

	// Space out multi-star systems around the center
	const spaceMultipleStars = (index: number): [x: number, y: number, z: number] =>
		pageData.stars.length <= 1
			? [-radii[index], -radii[index], -radii[index]]
			: spaceOutMultiStarSystem(index, pageData.stars.length, radii[index], radii);
</script>

<!-- ### Canvas utilities ### -->

<!-- Black background -->
<T.Color attach="background" args={['black']} />

<!-- User perspective camera -->
<T.PerspectiveCamera
	makeDefault
	position={[10, 10, 10]}
	near={0.01}
	far={settings.appearance.skyboxDistance * 2}
/>
<OrbitControls
	target={[0, 0, 0]}
	enableDamping
	enableRotate
	enableZoom
	enablePan
	minDistance={1}
	maxDistance={1000}
/>

<!-- ### Scene objects (stars, planets etc.) ### -->

<!-- Planets -->
{#each pageData.planets as planet (planet.name)}
	<Planet {planet} />
{/each}

<!-- Stars -->
{#each pageData.stars as star, i (star.name)}
	<Star {star} position={spaceMultipleStars(i)} />
{/each}

<!-- Visible systems skybox -->
{#key pageData.system.name}
	<VisibleSystemsSkybox systems={pageData.visibleSystems} {handleVisibleSystemClick} />
{/key}
