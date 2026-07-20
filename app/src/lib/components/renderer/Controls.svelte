<script lang="ts">
	import { getSettings } from '$lib/contexts/settings';

	let settings = getSettings();
	let isOpen = $state(false);

	type Control = {
		label: string;
		min: number;
		max: number;
		step: number;
		path: [section: keyof App.PageState['settings'], key: string];
	};

	// Define control
	const controls: Control[] = [
		{
			label: 'Simulation Rate (days/s)',
			min: 1,
			max: 1000,
			step: 1,
			path: ['simulation', 'rateDaysPerSecond']
		},
		{
			label: 'Body Size Scale',
			min: 1,
			max: 10000,
			step: 1,
			path: ['appearance', 'scalePlanetSize']
		},
		{
			label: 'Star Size Scale',
			min: 1,
			max: 100,
			step: 1,
			path: ['appearance', 'scaleStarSize']
		},
		{
			label: 'Star Brightness',
			min: 0,
			max: 100,
			step: 1,
			path: ['appearance', 'localStarIntensityMultiplier']
		},
		{
			label: 'Skybox Star Brightness',
			min: 0,
			max: 10000,
			step: 1,
			path: ['appearance', 'distantStarIntensityMultiplier']
		}
	];

	const getControlValue = (path: Control['path']): number => {
		const [section, key] = path;
		return settings[section][key] as number;
	};

	const clampControlValue = (value: number, control: Control) =>
		Math.min(control.max, Math.max(control.min, value));

	const onControlInput = (control: Control, value: string) => {
		if (value.trim() === '') return;
		const nextValue = Number(value);
		if (!Number.isFinite(nextValue)) return;
		const [section, key] = control.path;
		(settings[section][key] as number) = clampControlValue(nextValue, control);
	};

	const syncControlInput = (control: Control, input: HTMLInputElement) => {
		input.value = String(getControlValue(control.path));
	};
</script>

{#if isOpen}
	<aside
		class="absolute top-3 right-3 z-50 max-h-full w-72 overflow-auto rounded-md border border-white/20 bg-black/60 p-3 text-white backdrop-blur-sm"
	>
		<div class="flex items-center justify-between gap-3">
			<h2 class="font-display text-sm tracking-wide">Simulation Controls</h2>
			<button
				type="button"
				class="rounded border border-white/20 bg-white/10 px-2 py-1 font-body text-[11px] tracking-wide uppercase"
				onclick={() => (isOpen = false)}
			>
				Hide
			</button>
		</div>

		<div class="mt-3 space-y-3 font-body text-xs">
			{#each controls as control (control.label)}
				<label class="block">
					<span class="mb-1 block opacity-80">{control.label}</span>
					<input
						class="w-full"
						type="range"
						min={control.min}
						max={control.max}
						step={control.step}
						value={getControlValue(control.path)}
						oninput={(e) => onControlInput(control, e.currentTarget.value)}
					/>
					<input
						class="mt-1 w-full rounded bg-white/10 px-2 py-1"
						type="number"
						min={control.min}
						max={control.max}
						step={control.step}
						value={getControlValue(control.path)}
						oninput={(e) => onControlInput(control, e.currentTarget.value)}
						onblur={(e) => syncControlInput(control, e.currentTarget)}
					/>
				</label>
			{/each}
		</div>
	</aside>
{:else}
	<button
		type="button"
		class="absolute top-3 right-3 z-50 rounded-md border border-white/20 bg-black/60 px-3 py-2 font-display text-xs tracking-wide text-white backdrop-blur-sm"
		onclick={() => (isOpen = true)}
	>
		Settings
	</button>
{/if}
