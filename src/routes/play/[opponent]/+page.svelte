<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '$lib/shared/difficulty';
	let { data } = $props();
	let difficulty = $state<Difficulty>('medium');
	let starting = $state(false);

	async function start(format: 'bo1' | 'bo2') {
		starting = true;
		const res = await fetch('/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mode: 'match',
				opponentUserId: data.opponentUserId,
				format,
				difficulty
			})
		});
		if (res.status === 409) {
			const { activeChallengeId } = (await res.json()) as { activeChallengeId: string };
			goto(`/play/${data.opponentSlug}/match/${activeChallengeId}`);
			return;
		}
		const { id } = (await res.json()) as { id: string };
		goto(`/play/${data.opponentSlug}/match/${id}`);
	}
</script>

<main class="mx-auto max-w-md space-y-6 p-6 text-center">
	<h1 class="text-3xl font-bold">Scegli la difficoltà</h1>
	<div class="space-y-2 text-left">
		{#each DIFFICULTIES as d (d)}
			<label
				class="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition"
				class:border-emerald-500={difficulty === d}
				class:bg-emerald-50={difficulty === d}
			>
				<input type="radio" name="difficulty" value={d} bind:group={difficulty} class="mt-1" />
				<div>
					<div class="font-semibold">{DIFFICULTY_LABELS[d].label}</div>
					<div class="text-muted-foreground text-sm">{DIFFICULTY_LABELS[d].hint}</div>
				</div>
			</label>
		{/each}
	</div>

	<h2 class="text-2xl font-bold">Formato</h2>
	<div class="flex flex-col gap-3">
		<Button onclick={() => start('bo1')} disabled={starting}>Quick (Best of 1)</Button>
		<Button onclick={() => start('bo2')} disabled={starting} variant="outline">
			Standard (Best of 2)
		</Button>
	</div>
</main>
