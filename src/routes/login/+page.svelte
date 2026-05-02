<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';

	let email = $state('');
	let resumeId = $state('');
	let pending = $state(false);
	let createdId = $state<string | null>(null);
	let resumeError = $state<string | null>(null);

	async function playAsGuest() {
		pending = true;
		try {
			const res = await fetch('/api/guest-login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			if (!res.ok) throw new Error('failed');
			const data = (await res.json()) as { id: string };
			createdId = data.id;
		} finally {
			pending = false;
		}
	}

	async function resume(e: Event) {
		e.preventDefault();
		const id = resumeId.trim();
		if (!id) return;
		pending = true;
		resumeError = null;
		try {
			const res = await fetch('/api/guest-login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});
			if (res.status === 404) {
				resumeError = 'Guest ID not found';
				return;
			}
			if (res.status === 400) {
				resumeError = 'Invalid guest ID format';
				return;
			}
			if (!res.ok) throw new Error('failed');
			goto('/hub');
		} finally {
			pending = false;
		}
	}

	async function copy() {
		if (createdId) await navigator.clipboard.writeText(createdId);
	}

	function continueToHub() {
		goto('/hub');
	}
</script>

<div class="mx-auto mt-16 flex max-w-md flex-col gap-8 p-6">
	{#if createdId}
		<div class="flex flex-col gap-3 rounded-lg border-2 border-amber-500/60 bg-amber-50 p-5">
			<h2 class="text-xl font-semibold">Your guest ID</h2>
			<p class="text-sm">
				Save this somewhere safe if you want to come back to the same character later.
			</p>
			<code class="block rounded bg-white p-2 font-mono text-sm break-all select-all">
				{createdId}
			</code>
			<div class="flex flex-wrap gap-2">
				<Button onclick={copy}>Copy</Button>
				<Button onclick={continueToHub}>Continue to game →</Button>
			</div>
		</div>
	{:else}
		<section class="flex flex-col gap-3 opacity-50">
			<h2 class="text-xl font-semibold">Sign in with email</h2>
			<p class="text-xs">(coming soon — use guest mode below)</p>
			<Input type="email" disabled bind:value={email} placeholder="you@example.com" />
			<Button disabled>Send magic link</Button>
		</section>

		<div class="text-center text-sm opacity-60">— or —</div>

		<section class="flex flex-col gap-3">
			<h2 class="text-xl font-semibold">Play as guest</h2>
			<p class="text-sm">
				No registration. We'll give you a guest ID — save it to come back to this character.
			</p>
			<Button disabled={pending} onclick={playAsGuest}>
				{pending ? '...' : 'Play as Guest →'}
			</Button>
		</section>

		<form class="flex flex-col gap-3" onsubmit={resume}>
			<h2 class="text-xl font-semibold">Resume with your guest ID</h2>
			<Input type="text" bind:value={resumeId} placeholder="guest_..." />
			{#if resumeError}<p class="text-sm text-red-600">{resumeError}</p>{/if}
			<Button disabled={pending || !resumeId.trim()}>{pending ? '...' : 'Continue'}</Button>
		</form>
	{/if}
</div>
