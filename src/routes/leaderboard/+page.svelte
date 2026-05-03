<script lang="ts">
	import { onMount } from 'svelte';

	type Row = { userId: string | null; name: string | null; wins: number };
	let rows = $state<Row[]>([]);
	let loaded = $state(false);

	onMount(async () => {
		const r = await fetch('/api/leaderboard?type=challenges_won');
		const data = (await r.json()) as { data: Row[] };
		rows = data.data;
		loaded = true;
	});

	const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ` ${i + 1} `);
</script>

<svelte:head>
	<title>Leaderboard — Insult Sword Fighting</title>
</svelte:head>

<main class="mx-auto max-w-2xl p-6">
	<header class="mb-6 flex items-baseline justify-between">
		<h1 style="color: var(--primary); text-shadow: 3px 3px 0 #000;">Leaderboard</h1>
		<a href="/hub" class="font-body text-base underline opacity-70 hover:opacity-100">← Hub</a>
	</header>

	<div class="pixel-frame p-4">
		{#if !loaded}
			<p class="text-center opacity-60">Loading the wall of shame…</p>
		{:else if rows.length === 0}
			<div class="space-y-3 py-8 text-center">
				<p class="text-2xl">🏴 The leaderboard is empty.</p>
				<p class="opacity-70">No challenges completed yet. Be the first pirate on the wall.</p>
				<a
					href="/play"
					class="font-pixel mt-2 inline-block text-base no-underline"
					style="color: var(--primary);"
				>
					&gt;&gt; START A FIGHT &lt;&lt;
				</a>
			</div>
		{:else}
			<ol class="space-y-2">
				{#each rows as r, i (r.userId ?? i)}
					<li
						class="flex items-center justify-between gap-3 px-3 py-2"
						style="background: {i % 2 === 0 ? 'rgba(245,197,66,0.05)' : 'transparent'};"
					>
						<span class="font-pixel text-xs" style="color: var(--primary);">
							{medal(i)}
						</span>
						<span class="flex-1 truncate text-lg">{r.name ?? 'Anon'}</span>
						<span class="font-pixel text-xs" style="color: var(--foreground);">
							{r.wins} W
						</span>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</main>
