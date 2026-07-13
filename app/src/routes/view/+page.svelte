<script lang="ts">
	import { onMount } from 'svelte';
	import {
		AmbientLight,
		BufferGeometry,
		Color,
		Float32BufferAttribute,
		PerspectiveCamera,
		Points,
		PointsMaterial,
		Scene,
		WebGLRenderer
	} from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

	type SimulationSystem = {
		id?: string;
		name?: string;
		type?: string;
		x?: number;
		y?: number;
		z?: number;
		coords?: {
			x?: number;
			y?: number;
			z?: number;
		};
		isStart?: boolean;
	};

	type SimulationPayload = {
		startSystem?: {
			id?: string;
			name?: string;
		};
		systems?: SimulationSystem[];
		source?: string;
	};

	type RenderPoint = {
		position: [number, number, number];
		isStar: boolean;
		isStart: boolean;
	};

	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let viewportElement = $state<HTMLDivElement | null>(null);
	const endpoint = '/api/simulation/v1?start=sol&limit=1200';

	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let totalCount = $state(0);
	let starCount = $state(0);
	let planetCount = $state(0);
	let startCount = $state(0);
	let dataSource = $state('');

	const parseSimulationPayload = (payload: unknown): SimulationPayload | null => {
		if (!payload || typeof payload !== 'object') {
			return null;
		}

		const candidate = payload as Partial<SimulationPayload>;
		if (!Array.isArray(candidate.systems)) {
			return null;
		}

		return {
			startSystem: candidate.startSystem,
			source: typeof candidate.source === 'string' ? candidate.source : 'unknown',
			systems: candidate.systems.filter((system): system is SimulationSystem => {
				if (!system || typeof system !== 'object') {
					return false;
				}

				const x = Number((system as SimulationSystem).x ?? (system as SimulationSystem).coords?.x);
				const y = Number((system as SimulationSystem).y ?? (system as SimulationSystem).coords?.y);
				const z = Number((system as SimulationSystem).z ?? (system as SimulationSystem).coords?.z);
				return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z);
			})
		};
	};

	const toPoint = (system: SimulationSystem): RenderPoint | null => {
		const x = Number(system.x ?? system.coords?.x);
		const y = Number(system.y ?? system.coords?.y);
		const z = Number(system.z ?? system.coords?.z);

		if (![x, y, z].every((value) => Number.isFinite(value))) {
			return null;
		}

		const nodeType = String(system.type ?? '').toLowerCase();
		const name = String(system.name ?? system.id ?? '').toLowerCase();

		return {
			position: [x, y, z],
			isStar: nodeType.includes('star') || name.includes('star'),
			isStart: Boolean(system.isStart)
		};
	};

	const renderScene = (systems: SimulationSystem[]) => {
		if (!canvasElement || !viewportElement) {
			return () => {};
		}

		const scene = new Scene();
		scene.background = new Color('#050a16');

		const width = viewportElement.clientWidth || window.innerWidth;
		const height = viewportElement.clientHeight || window.innerHeight;

		const camera = new PerspectiveCamera(60, width / height, 0.1, 5000);
		camera.position.set(0, 60, 220);

		const renderer = new WebGLRenderer({
			canvas: canvasElement,
			antialias: true,
			alpha: false
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(width, height);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.minDistance = 20;
		controls.maxDistance = 800;

		scene.add(new AmbientLight('#88aaff', 0.4));

		const points = systems.map(toPoint).filter((value): value is RenderPoint => value !== null);

		totalCount = points.length;
		starCount = points.filter((point) => point.isStar).length;
		planetCount = totalCount - starCount;
		startCount = points.filter((point) => point.isStart).length;

		const starPositions: number[] = [];
		const planetPositions: number[] = [];
		const startPositions: number[] = [];
		for (const point of points) {
			const target = point.isStart
				? startPositions
				: point.isStar
					? starPositions
					: planetPositions;
			target.push(...point.position);
		}

		const makeCloud = (positions: number[], color: string, size: number) => {
			const geometry = new BufferGeometry();
			geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
			const material = new PointsMaterial({ color, size, sizeAttenuation: true });
			return new Points(geometry, material);
		};

		const starCloud = makeCloud(starPositions, '#ffe28a', 3.5);
		const planetCloud = makeCloud(planetPositions, '#63d4ff', 2.2);
		const startCloud = makeCloud(startPositions, '#ff8f42', 5.2);
		scene.add(starCloud);
		scene.add(planetCloud);
		scene.add(startCloud);

		let rafId = 0;
		const animate = () => {
			rafId = requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		};
		animate();

		const onResize = () => {
			if (!viewportElement) {
				return;
			}
			const w = viewportElement.clientWidth || window.innerWidth;
			const h = viewportElement.clientHeight || window.innerHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h);
		};

		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(rafId);
			controls.dispose();
			starCloud.geometry.dispose();
			planetCloud.geometry.dispose();
			startCloud.geometry.dispose();
			(starCloud.material as PointsMaterial).dispose();
			(planetCloud.material as PointsMaterial).dispose();
			(startCloud.material as PointsMaterial).dispose();
			renderer.dispose();
		};
	};

	onMount(() => {
		let cleanup = () => {};

		const loadAndRender = async () => {
			try {
				const response = await fetch(endpoint);
				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				const payload = await response.json();
				const simulation = parseSimulationPayload(payload);
				if (!simulation) {
					throw new Error('Invalid simulation payload');
				}

				dataSource = simulation.source ?? 'unknown';

				cleanup();
				cleanup = renderScene(simulation.systems ?? []);
				status = 'ready';
			} catch {
				cleanup();
				totalCount = 0;
				starCount = 0;
				planetCount = 0;
				startCount = 0;
				dataSource = '';
				status = 'error';
			}
		};

		void loadAndRender();

		return () => {
			cleanup();
		};
	});
</script>

<section class="view-route">
	<div class="hud">
		<h1>AstroJSON Galactic Viewer</h1>
		<p>Simple map of stars and planets from AstroJSON Point features.</p>

		<div class="stats">
			<span>Total: {totalCount}</span>
			<span>Focus: {startCount}</span>
			<span>Stars: {starCount}</span>
			<span>Planets: {planetCount}</span>
		</div>

		<div class="legend">
			<span><i class="dot start"></i> Start System</span>
			<span><i class="dot star"></i> Stars</span>
			<span><i class="dot planet"></i> Planets</span>
		</div>

		{#if status === 'loading'}
			<p class="status">Loading AstroJSON data...</p>
		{:else if status === 'error'}
			<p class="status error">Failed to load live simulation data from {endpoint}.</p>
		{:else if status === 'ready'}
			<p class="status">Live render ready from {dataSource}. Drag to orbit, scroll to zoom.</p>
		{/if}
	</div>

	<div bind:this={viewportElement} class="viewport">
		<canvas bind:this={canvasElement} aria-label="3D map of galactic objects"></canvas>
	</div>
</section>

<style>
	.view-route {
		display: grid;
		grid-template-columns: 320px 1fr;
		gap: 1rem;
		height: 100%;
		padding: 1rem;
		background:
			radial-gradient(circle at 18% 12%, rgba(61, 117, 255, 0.35), transparent 42%),
			radial-gradient(circle at 80% 88%, rgba(255, 199, 99, 0.18), transparent 48%),
			linear-gradient(180deg, #060a13, #0c1425 56%, #090f1f);
		color: #eaf2ff;
	}

	.hud {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 1rem;
		border: 1px solid rgba(130, 180, 255, 0.28);
		border-radius: 14px;
		background: rgba(10, 18, 34, 0.85);
	}

	h1 {
		margin: 0;
		font-size: 1.25rem;
		letter-spacing: 0.03em;
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		color: #b6c8ee;
	}

	.stats,
	.legend {
		display: grid;
		gap: 0.35rem;
		font-size: 0.9rem;
	}

	.dot {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		margin-right: 0.4rem;
	}

	.dot.star {
		background: #ffe28a;
	}

	.dot.start {
		background: #ff8f42;
	}

	.dot.planet {
		background: #63d4ff;
	}

	.status {
		padding: 0.5rem 0.6rem;
		border-radius: 10px;
		background: rgba(111, 163, 255, 0.14);
		color: #d4e4ff;
	}

	.status.error {
		background: rgba(255, 92, 92, 0.12);
		color: #ffd8d8;
	}

	.viewport {
		position: relative;
		overflow: hidden;
		border: 1px solid rgba(130, 180, 255, 0.28);
		border-radius: 14px;
		min-height: 60vh;
		background: radial-gradient(circle at 50% 40%, #0f1f3a, #070d1a 60%, #060914);
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 900px) {
		.view-route {
			grid-template-columns: 1fr;
		}

		.hud {
			order: 2;
		}

		.viewport {
			order: 1;
			min-height: 50vh;
		}
	}
</style>
