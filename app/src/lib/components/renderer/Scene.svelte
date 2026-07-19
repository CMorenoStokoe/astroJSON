<script lang="ts">
	import { T } from '@threlte/core';
	import { interactivity, OrbitControls } from '@threlte/extras';
	import Planet from './planet/Planet.svelte';
	import Star from './star/Star.svelte';
	interactivity();

	let { pageData }: { pageData: App.PageData } = $props();

	// const scale = new Spring(1);

	// Calculate rnderspace star radii
	const radii = pageData.stars.map(({ radius }) => (radius ?? 1) * 0.00465047);

	// Space out multi-star systems around the center
	const spaceMultipleStars = (index: number): [x: number, y: number, z: number] =>
		pageData.stars.length <= 1
			? [-radii[index], -radii[index], -radii[index]]
			: [
					Math.cos((index / pageData.stars.length) * Math.PI * 2) * 0.02 - radii[index],
					-radii[index],
					Math.sin((index / pageData.stars.length) * Math.PI * 2) * 0.02 - radii[index]
				];
</script>

<!-- Black background -->
<T.Color attach="background" args={['black']} />

<!-- User perspective camera -->
<T.PerspectiveCamera makeDefault position={[10, 10, 10]} near={0.01} far={10000} />
<OrbitControls
	target={[0, 0, 0]}
	enableDamping
	enableRotate
	enableZoom
	enablePan
	minDistance={1}
	maxDistance={1000}
/>

<!-- Scene objects (stars, planets etc.) -->
<!-- Planets -->
{#each pageData.planets as planet (planet.name)}
	<Planet {planet} />
{/each}
<!-- Stars -->
{#each pageData.stars as star, i (star.name)}
	<Star {star} position={spaceMultipleStars(i)} />
{/each}

<!-- Visible systems skybox -->

<!--
<T.Mesh
	rotation.y={rotation}
	position.y={1}
	scale={scale.current}
	onpointerenter={() => {
		scale.target = 1.5;
	}}
	onpointerleave={() => {
		scale.target = 1;
	}}
	castShadow
>
	<T.BoxGeometry args={[1, 2, 1]} />
	<T.MeshStandardMaterial color="hotpink" />
</T.Mesh>

<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
	<T.CircleGeometry args={[4, 40]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh>
-->
