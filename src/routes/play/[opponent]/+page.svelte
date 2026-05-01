<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	let { data } = $props();

	async function start(format: 'bo1' | 'bo2') {
		const res = await fetch('/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ mode: 'match', opponentUserId: data.opponentUserId, format })
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

<main class="mx-auto max-w-md p-8 text-center">
	<h1 class="mb-8 text-3xl">Choose format</h1>
	<div class="flex flex-col gap-4">
		<Button onclick={() => start('bo1')}>Quick (Best of 1)</Button>
		<Button onclick={() => start('bo2')}>Standard (Best of 2)</Button>
	</div>
</main>
