<script lang="ts">
	import { onMount } from 'svelte';
	import Canvas from '../lib/components/renderer/Canvas.svelte';

	let pageData = $state<App.PageData>();

	const loadSystem = async (systemName: string) => {
		const response = await fetch('/api/neo4j', {
			method: 'POST',
			body: JSON.stringify({ systemName })
		});
		pageData = await response.json();
		console.log(`Got system data for ${systemName}`, pageData);
	};

	onMount(() => {
		loadSystem('Solar System');
	});
</script>

<!-- 3d visualisation -->
<div class="relative h-full w-full">
	{#if pageData}
		<Canvas {pageData} />
	{/if}
</div>

<!-- GUI -->
<h1 class="absolute top-0 left-0 text-white">{pageData?.system?.name}</h1>
