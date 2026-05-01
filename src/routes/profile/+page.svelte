<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let displayName = $state('');
	let language: 'en' | 'it' = $state('en');
	let anonymous = $state(false);
	let saving = $state(false);

	async function save() {
		saving = true;
		await fetch('/api/profile', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ displayName, language, anonymous })
		});
		saving = false;
	}

	async function exportData() {
		window.location.href = '/api/account/export';
	}

	async function deleteAccount() {
		if (!confirm('Delete account? This cannot be undone.')) return;
		await fetch('/api/account/delete', { method: 'POST' });
		window.location.href = '/';
	}
</script>

<main class="mx-auto max-w-md space-y-4 p-8">
	<h1 class="text-3xl">Profile</h1>
	<label class="block">
		<span>Display name</span>
		<Input bind:value={displayName} maxlength={30} />
	</label>
	<label class="block">
		<span>Language</span>
		<select bind:value={language} class="w-full rounded border p-2">
			<option value="en">English</option>
			<option value="it">Italiano</option>
		</select>
	</label>
	<label class="flex items-center gap-2">
		<input type="checkbox" bind:checked={anonymous} />
		<span>Show as anonymous on leaderboard</span>
	</label>
	<Button onclick={save} disabled={saving}>{saving ? '...' : 'Save'}</Button>
	<hr />
	<Button variant="outline" onclick={exportData}>Export my data</Button>
	<Button variant="destructive" onclick={deleteAccount}>Delete account</Button>
</main>
