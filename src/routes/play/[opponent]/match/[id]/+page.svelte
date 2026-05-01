<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	type PoolEntry = { id: string; text: string; normalized: string };

	let { data } = $props();
	let phrase = $state('');
	let timer = $state(25);
	let submitting = $state(false);
	let lastResult = $state<{ judgment: string; reasoning?: string | null } | null>(null);
	const mode: 'attack' | 'defense' = $state('attack');
	let search = $state('');
	let tab: 'yours' | 'free' = $state('yours');

	onMount(() => {
		const i = setInterval(() => {
			if (timer > 0) timer--;
		}, 1000);
		return () => clearInterval(i);
	});

	async function submit() {
		if (!data.challenge) return;
		submitting = true;
		const idemKey = crypto.randomUUID();
		const res = await fetch(`/api/challenges/${data.challenge.id}/turn`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idemKey },
			body: JSON.stringify({
				text: phrase,
				source: tab === 'yours' ? 'personal_pool' : 'free_text'
			})
		});
		lastResult = (await res.json()) as { judgment: string; reasoning?: string | null };
		submitting = false;
		timer = 25;
	}

	const pool = $derived<PoolEntry[]>(
		(mode === 'attack' ? data.attackPool : data.defensePool) as PoolEntry[]
	);
	const filtered = $derived(pool.filter((p) => p.normalized.includes(search.toLowerCase())));
</script>

<div class="grid h-screen grid-rows-[60vh_40vh]">
	<div class="relative bg-blue-950">
		<div class="absolute top-4 right-4 rounded bg-black/40 px-3 py-1 font-bold text-yellow-300">
			⏱ {timer}s
		</div>
	</div>
	<div class="bg-black p-4 text-yellow-300">
		<div class="mb-2 flex gap-2">
			<Button onclick={() => (tab = 'yours')} variant={tab === 'yours' ? 'default' : 'outline'}>
				Yours
			</Button>
			<Button onclick={() => (tab = 'free')} variant={tab === 'free' ? 'default' : 'outline'}>
				Free text
			</Button>
		</div>
		{#if tab === 'yours'}
			<Input bind:value={search} placeholder="Search…" class="mb-2 bg-zinc-900" />
			<div class="max-h-32 overflow-y-auto font-mono">
				{#each filtered as e (e.id)}
					<button
						type="button"
						class="w-full cursor-pointer text-left hover:bg-zinc-800"
						onclick={() => (phrase = e.text)}
					>
						{e.text}
					</button>
				{/each}
			</div>
		{:else}
			<Input
				bind:value={phrase}
				maxlength={280}
				placeholder="Type your insult…"
				class="bg-zinc-900"
			/>
		{/if}
		<Button onclick={submit} disabled={submitting} class="mt-2">
			{submitting ? '...' : 'Submit'}
		</Button>
		{#if lastResult}
			<p class="mt-2 text-sm">Last: {lastResult.judgment} — {lastResult.reasoning ?? ''}</p>
		{/if}
	</div>
</div>
