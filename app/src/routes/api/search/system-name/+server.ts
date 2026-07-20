import { json } from '@sveltejs/kit';
import systems from './systems.json';

type SystemSearchEntry = (typeof systems)[number];

type TrieNode = {
	children: Record<string, TrieNode>;
	systemIndexes: number[];
};

const MAX_RESULTS = 20;

const createTrieNode = (): TrieNode => ({
	children: {},
	systemIndexes: []
});

const normalizeSearchTerm = (value: string) => value.trim().toLowerCase();

// Load in csv of all system names and parse into a trie
const systemNamesTrie: TrieNode = createTrieNode();
for (const [index, system] of systems.entries()) {
	let node = systemNamesTrie;
	const normalizedName = normalizeSearchTerm(system.name);

	for (const character of normalizedName) {
		node = node.children[character] ??= createTrieNode();
		node.systemIndexes.push(index);
	}
}

const searchSystemsByPrefix = (searchTerm: string): SystemSearchEntry[] => {
	const normalizedSearchTerm = normalizeSearchTerm(searchTerm);
	if (!normalizedSearchTerm) return [];

	let node = systemNamesTrie;
	for (const character of normalizedSearchTerm) {
		node = node.children[character];
		if (!node) return [];
	}

	return node.systemIndexes.slice(0, MAX_RESULTS).map((index) => systems[index]);
};

// Returns subgraph of systems visible from a given system
export const POST = async ({ request }) => {
	console.log('POST request received for /api/search/system-name');
	const { searchTerm } = await request.json();

	if (typeof searchTerm !== 'string') {
		return json({ error: 'searchTerm must be a string', matches: [] }, { status: 400 });
	}

	const matches = searchSystemsByPrefix(searchTerm);
	return json({ matches });
};
