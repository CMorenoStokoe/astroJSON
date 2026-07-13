<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Scene,
		PerspectiveCamera,
		WebGLRenderer,
		BoxGeometry,
		MeshBasicMaterial,
		Mesh
	} from 'three';

	// Bind directly to the canvas element, typed correctly
	let canvasElement: HTMLCanvasElement;
	let animationFrameId: number;

	onMount(() => {
		// 1. Create the Scene
		const scene = new Scene();

		// 2. Setup the Camera (Get dimensions from the canvas parent or window)
		const width = canvasElement.parentElement?.clientWidth || window.innerWidth;
		const height = canvasElement.parentElement?.clientHeight || window.innerHeight;
		const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.z = 5;

		// 3. Setup the Renderer using Svelte's canvas node directly
		const renderer = new WebGLRenderer({
			canvas: canvasElement, // <-- Safe: No DOM manipulation required
			antialias: true
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// 4. Add an Object
		const geometry = new BoxGeometry(2, 2, 2);
		const material = new MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
		const cube = new Mesh(geometry, material);
		scene.add(cube);

		// 5. Animation Loop
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);

			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;

			renderer.render(scene, camera);
		};

		animate();

		// 6. Handle window resize safely
		const handleResize = () => {
			const w = canvasElement.parentElement?.clientWidth || window.innerWidth;
			const h = canvasElement.parentElement?.clientHeight || window.innerHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h);
		};

		window.addEventListener('resize', handleResize);

		// Clean up
		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationFrameId);
			renderer.dispose();
		};
	});
</script>

<canvas bind:this={canvasElement} class="h-full w-full"></canvas>
