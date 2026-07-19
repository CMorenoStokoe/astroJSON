<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		// Fetch data from the Neo4j database
		const response = await fetch('/api/neo4j-data', {
			method: 'POST',
			body: JSON.stringify({ systemName: 'Solar System' })
		});
		const data = await response.json();

		// Log the fetched data to the console
		console.log('Fetched data from Neo4j:', data);
	});
</script>
