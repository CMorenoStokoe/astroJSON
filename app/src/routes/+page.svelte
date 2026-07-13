<script lang="ts">
	import { onMount } from 'svelte';
	import {
		BufferGeometry,
		Float32BufferAttribute,
		Points,
		PointsMaterial,
		Scene,
		PerspectiveCamera,
		WebGLRenderer
	} from 'three';

	let canvas: HTMLCanvasElement;
	let frame = 0;

	onMount(() => {
		let geometry: BufferGeometry;
		let material: PointsMaterial;
		let renderer: WebGLRenderer;

		const run = async () => {
			const data = await fetch('/api/simulation/v1?start=sol').then((r) => r.json());

			const scene = new Scene();
			const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
			camera.position.z = 120;

			renderer = new WebGLRenderer({ canvas, antialias: true });
			renderer.setSize(window.innerWidth, window.innerHeight);

			const positions: number[] = [];
			for (const s of data.systems) positions.push(s.x, s.y, s.z);

			geometry = new BufferGeometry();
			geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
			material = new PointsMaterial({ size: 2.5, color: '#7dc3ff' });
			const points = new Points(geometry, material);
			scene.add(points);

			const loop = () => {
				frame = requestAnimationFrame(loop);
				renderer.render(scene, camera);
			};
			loop();
		};

		void run();

		return () => {
			cancelAnimationFrame(frame);
			geometry.dispose();
			material.dispose();
			renderer.dispose();
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		width: 100vw;
		height: 100vh;
	}
</style>
