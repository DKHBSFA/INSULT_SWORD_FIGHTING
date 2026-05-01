<script lang="ts">
	import { onMount } from 'svelte';
	let lang: 'en' | 'it' = $state('en');
	let body = $state('');

	async function load() {
		const r = await fetch(`/TERMS.${lang}.md`);
		body = await r.text();
	}

	onMount(load);
	$effect(() => {
		void lang;
		load();
	});
</script>

<main class="prose mx-auto p-8">
	<select bind:value={lang} class="rounded border p-1">
		<option value="en">EN</option>
		<option value="it">IT</option>
	</select>
	<pre class="mt-4 whitespace-pre-wrap">{body}</pre>
</main>
