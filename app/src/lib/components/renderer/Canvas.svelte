<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { SOL_SYSTEM } from '../../example/system';

	let { pageData = SOL_SYSTEM }: { pageData: App.PageData } = $props();
</script>

<Canvas>
	<Scene {pageData} />
</Canvas>
