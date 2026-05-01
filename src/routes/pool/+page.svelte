<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	type Entry = { id: string; text: string; source: string };

	let kind: 'attack' | 'defense' = $state('attack');
	let entries = $state<Entry[]>([]);
	let newText = $state('');

	async function load() {
		const r = await fetch(`/api/pool?kind=${kind}`);
		const data = (await r.json()) as { entries: Entry[] };
		entries = data.entries;
	}

	async function add() {
		if (!newText.trim()) return;
		await fetch('/api/pool', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ kind, text: newText })
		});
		newText = '';
		await load();
	}

	async function remove(id: string) {
		await fetch(`/api/pool/${id}`, { method: 'DELETE' });
		await load();
	}

	onMount(load);
	$effect(() => {
		void kind;
		load();
	});
</script>

<main class="mx-auto max-w-3xl p-8">
	<h1 class="mb-4 text-3xl">Your pool</h1>
	<div class="mb-4 flex gap-2">
		<Button onclick={() => (kind = 'attack')} variant={kind === 'attack' ? 'default' : 'outline'}>
			Attacks
		</Button>
		<Button onclick={() => (kind = 'defense')} variant={kind === 'defense' ? 'default' : 'outline'}>
			Defenses
		</Button>
	</div>
	<div class="mb-4 flex gap-2">
		<Input bind:value={newText} placeholder="New entry…" maxlength={280} />
		<Button onclick={add}>Add</Button>
	</div>
	<ul class="space-y-2">
		{#each entries as e (e.id)}
			<li class="flex justify-between rounded border p-2">
				<span>{e.text}</span>
				<Button variant="outline" onclick={() => remove(e.id)}>Delete</Button>
			</li>
		{/each}
	</ul>
</main>
