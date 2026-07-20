<script lang="ts">
	type SystemSearchMatch = {
		id: string;
		name: string;
		type: string;
		coords: [number, number, number];
		brightness: number;
		color: number;
		hasDebrisDisk: boolean;
	};

	let {
		currentSystemName,
		handleLoadSystem
	}: {
		currentSystemName: string | undefined;
		handleLoadSystem: (systemName: string) => Promise<void> | void;
	} = $props();

	let searchTerm = $state('');
	let searchMatches = $state<SystemSearchMatch[]>([]);
	let isSearching = $state(false);
	let searchError = $state<string | null>(null);
	let searchTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let searchAbortController: AbortController | null = null;

	const handleSelectSystem = async (systemName: string) => {
		if (searchTimeoutId) clearTimeout(searchTimeoutId);
		searchAbortController?.abort();
		searchTerm = '';
		searchMatches = [];
		searchError = null;
		isSearching = false;
		await handleLoadSystem(systemName);
	};

	const handleSearchInput = (value: string) => {
		searchTerm = value;
		if (searchTimeoutId) clearTimeout(searchTimeoutId);
		searchAbortController?.abort();

		const normalizedSearchTerm = value.trim();
		if (!normalizedSearchTerm) {
			searchMatches = [];
			searchError = null;
			isSearching = false;
			return;
		}

		isSearching = true;
		searchError = null;
		searchTimeoutId = setTimeout(async () => {
			const controller = new AbortController();
			searchAbortController = controller;

			try {
				const response = await fetch('/api/search/system-name', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ searchTerm: normalizedSearchTerm }),
					signal: controller.signal
				});

				if (!response.ok) throw new Error('Search request failed');

				const { matches } = (await response.json()) as { matches?: SystemSearchMatch[] };
				searchMatches = matches ?? [];
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') return;
				searchMatches = [];
				searchError = 'Unable to search systems right now';
			} finally {
				if (searchAbortController === controller) searchAbortController = null;
				if (!controller.signal.aborted) isSearching = false;
			}
		}, 150);
	};
</script>

<div
	class="absolute top-3 left-1/2 z-40 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 text-white"
>
	<input
		class="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 font-display text-white backdrop-blur-sm outline-none placeholder:text-white/50"
		type="search"
		placeholder={currentSystemName ?? 'Search systems'}
		value={searchTerm}
		oninput={(e) => handleSearchInput(e.currentTarget.value)}
		autocomplete="off"
	/>

	{#if searchError}
		<p class="mt-2 font-body text-xs text-red-300">{searchError}</p>
	{:else if isSearching}
		<p class="mt-2 font-body text-xs opacity-70">Searching...</p>
	{:else if searchTerm.trim() && searchMatches.length === 0}
		<p class="mt-2 font-body text-xs opacity-70">No matching systems</p>
	{/if}

	{#if searchMatches.length > 0}
		<div class="mt-2 max-h-56 overflow-auto rounded-md border border-white/10 bg-black/40">
			{#each searchMatches as match (match.id)}
				<button
					type="button"
					class="flex w-full items-center justify-between border-b border-white/10 px-3 py-2 text-left font-body text-sm last:border-b-0 hover:bg-white/10"
					onclick={() => handleSelectSystem(match.name)}
				>
					<span>{match.name}</span>
					<span class="text-xs opacity-60">{match.type}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
