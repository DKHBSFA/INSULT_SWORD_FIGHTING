<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';

	let email = $state('');
	let pending = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		pending = true;
		await fetch('/api/auth/sign-in/magic-link/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});
		pending = false;
		goto('/login/sent');
	}
</script>

<form onsubmit={submit} class="mx-auto mt-24 flex max-w-md flex-col gap-4 p-6">
	<h1 class="text-3xl">Login</h1>
	<Input type="email" required bind:value={email} placeholder="you@example.com" />
	<Button disabled={pending}>{pending ? '...' : 'Send magic link'}</Button>
</form>
