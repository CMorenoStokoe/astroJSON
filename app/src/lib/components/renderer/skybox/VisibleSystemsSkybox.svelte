<script lang="ts">
	import { T } from '@threlte/core';
	import { BufferAttribute, BufferGeometry } from 'three';
	import Label from './Label.svelte';
	import { interactivity } from '@threlte/extras';
	import { getSettings } from '$lib/contexts/settings';
	import { accurateColorStar } from '../common/accurateColorStars';
	const { raycaster } = interactivity();
	let settings = getSettings();

	type PointsEvent = { intersections?: Array<{ index?: number }> };

	let {
		systems,
		handleVisibleSystemClick
	}: {
		systems: App.PageData['visibleSystems'];
		handleVisibleSystemClick: (system: App.PageData['visibleSystems'][number]) => void;
	} = $props();

	// States
	let isHovering = $state<{
		system: App.PageData['visibleSystems'][number];
		position: [number, number, number];
	} | null>();

	// Build point cloud geometry for all visible systems
	const pointsData = $derived.by(() => {
		// Initialise lightweight arrays for point cloud positions and colors
		const positions: Float32Array = new Float32Array(systems.length * 3);
		const colors = new Float32Array(systems.length * 3);

		// Render each visible system as a point in the skybox
		for (let i = 0; i < systems.length; i++) {
			const system = systems[i];
			const [x, y, z] = system.viewpoint.direction;

			// Calculate distance against skybox
			positions[i * 3] = x * settings.appearance.skyboxDistance;
			positions[i * 3 + 1] = y * settings.appearance.skyboxDistance;
			positions[i * 3 + 2] = z * settings.appearance.skyboxDistance;

			// Color each point based on the star's color
			const { r, g, b } = accurateColorStar(system);
			colors[i * 3] = r;
			colors[i * 3 + 1] = g;
			colors[i * 3 + 2] = b;

			// Use the star's brightness to scale the intensity of the point cloud
			const intensity = Math.max(
				0.1, // Base brightness
				Math.min(
					1,
					settings.appearance.distantStarIntensityMultiplier *
						10 ** (-0.4 * (system.viewpoint.apparentBrightness + 1.5))
				)
			);
			colors[i * 3] = r * intensity;
			colors[i * 3 + 1] = g * intensity;
			colors[i * 3 + 2] = b * intensity;
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(positions, 3));
		geometry.setAttribute('color', new BufferAttribute(colors, 3));

		return { positions, geometry };
	});

	// Expand hitbox for hovering/clicking on each point
	raycaster.params.Points.threshold = settings.appearance.skyboxDistance * 0.015;

	// Handlers
	const handlePointsHover = (e: PointsEvent) => {
		// Identify system target
		const i = e.intersections?.[0]?.index;
		if (i === undefined) {
			isHovering = null;
			document.body.style.cursor = 'auto';
			return;
		}

		// Mark up valid targets
		const system = systems[i];
		const position: [number, number, number] = [
			pointsData.positions[i * 3],
			pointsData.positions[i * 3 + 1],
			pointsData.positions[i * 3 + 2]
		];
		isHovering = { system, position };
		document.body.style.cursor = 'pointer';
	};
	const handlePointsClick = (e: PointsEvent) => {
		const i = e.intersections?.[0]?.index;
		if (typeof i !== 'number') return;
		const system = systems[i];
		if (system) handleVisibleSystemClick(system);
	};
</script>

<!-- Draw all visible systems as one lightweight point cloud -->
<T.Points
	geometry={pointsData.geometry}
	onpointerdown={handlePointsClick}
	onpointermove={handlePointsHover}
	onpointerleave={handlePointsHover}
>
	<!-- Single material used by each point
@description
	vertexColors - each point can use a different color
	depthWrite - save writing to depth buffer for more performance we wont use this property for them anyway
	tone mapping - prevents background stars from incorrectly obscuring planets, orbit lines or other objects
-->
	<T.PointsMaterial
		size={2}
		sizeAttenuation={false}
		vertexColors
		transparent
		depthWrite={false}
		toneMapped={false}
	/>
</T.Points>

{#if isHovering}
	<!-- Show label for hovered system -->
	<Label {...isHovering} />
{/if}
