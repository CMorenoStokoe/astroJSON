<script lang="ts">
	import { onMount } from 'svelte';
	import Canvas from '../lib/components/renderer/Canvas.svelte';
	import Controls from '$lib/components/renderer/Controls.svelte';
	import SystemSearch from '$lib/components/renderer/SystemSearch.svelte';
	import { simulationSettings } from '../lib/config/settings';
	import { setSettings } from '$lib/contexts/settings';

	const DATABASE_DEPLOYMENT_MODE: 'local' | 'neo4j' = 'local';

	let pageData = $state<App.PageData>();

	// Global settings context
	let settings = $state<App.PageState['settings']>(simulationSettings);
	setSettings(settings);

	// Handlers
	const handleLoadSystem = async (systemName: string) => {
		const response = await fetch(
			DATABASE_DEPLOYMENT_MODE === 'local' ? '/api/local' : '/api/neo4j',
			{
				method: 'POST',
				body: JSON.stringify({ systemName })
			}
		);
		pageData = await response.json();
		console.log(`Got system data for ${systemName}`, $state.snapshot(pageData));
	};

	// Lifecycle
	onMount(() => {
		handleLoadSystem('Solar System');
	});
</script>

<!-- 3d visualisation -->
<div class="relative h-full max-h-full w-full max-w-full overflow-hidden">
	<SystemSearch currentSystemName={pageData?.system?.name} {handleLoadSystem} />
	{#if pageData}
		<Canvas {pageData} {handleLoadSystem} />
		<Controls />
	{/if}
</div>
