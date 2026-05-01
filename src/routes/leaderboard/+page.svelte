<script lang="ts">
	import { onMount } from 'svelte';

	type Row = { userId: string | null; name: string | null; wins: number };
	let rows = $state<Row[]>([]);

	onMount(async () => {
		const r = await fetch('/api/leaderboard?type=challenges_won');
		const data = (await r.json()) as { data: Row[] };
		rows = data.data;
	});
</script>

<main class="mx-auto max-w-2xl p-8">
	<h1 class="mb-4 text-3xl">Leaderboard</h1>
	<ol class="space-y-1">
		{#each rows as r, i (r.userId ?? i)}
			<li class="flex justify-between rounded border p-2">
				<span>{i + 1}. {r.name ?? 'Anon'}</span>
				<span>{r.wins}</span>
			</li>
		{/each}
	</ol>
</main>
