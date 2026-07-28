<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	let {
		pageData,
		handleLoadSystem
	}: { pageData: App.PageData; handleLoadSystem: (systemId: string) => void } = $props();
</script>

<Canvas renderMode="always">
	<Scene {pageData} {handleLoadSystem} />
</Canvas>
