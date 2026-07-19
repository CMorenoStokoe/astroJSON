<script lang="ts">
	import { T } from '@threlte/core';
	import { BufferAttribute, BufferGeometry, Color } from 'three';
	import { textureSkyboxSystem } from './textureSkyboxSystem';
	import { SKYBOX_DISTANCE } from '../../../config/settings';

	let {
		systems
	}: {
		systems: App.PageData['visibleSystems'];
	} = $props();

	const geometry = new BufferGeometry();

	const positions = new Float32Array(systems.length * 3);
	const colors = new Float32Array(systems.length * 3);

	for (let i = 0; i < systems.length; i++) {
		const system = systems[i];

		// direction is already relative to the current system
		const [x, y, z] = system.viewpoint.direction;
		const length = Math.hypot(x, y, z) || 1;

		// Keep direction, discard real distance, place on sky sphere
		positions[i * 3] = (x / length) * SKYBOX_DISTANCE;
		positions[i * 3 + 1] = (y / length) * SKYBOX_DISTANCE;
		positions[i * 3 + 2] = (z / length) * SKYBOX_DISTANCE;

		const color = new Color(textureSkyboxSystem(system).color);

		colors[i * 3] = color.r;
		colors[i * 3 + 1] = color.g;
		colors[i * 3 + 2] = color.b;
	}

	geometry.setAttribute('position', new BufferAttribute(positions, 3));
	geometry.setAttribute('color', new BufferAttribute(colors, 3));
</script>

<!-- Draw all visible systems as one lightweight point cloud -->
<T.Points {geometry} frustumCulled={false}>
	<T.PointsMaterial
		size={2}
		sizeAttenuation={false}
		vertexColors
		transparent
		opacity={0.9}
		depthWrite={false}
		toneMapped={false}
	/>
</T.Points>
