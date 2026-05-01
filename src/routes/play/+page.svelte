<script lang="ts">
	let { data } = $props();
</script>

<main class="mx-auto max-w-4xl p-8">
	<h1 class="mb-8 text-4xl">Choose your opponent</h1>
	<div class="grid grid-cols-2 gap-6">
		{#each data.personas as p (p.id)}
			<a href={`/play/${p.id}`} class="hover:bg-muted rounded border p-6">
				<img src={p.spriteSetUrl} alt={p.name} class="mx-auto h-40" />
				<h2 class="mt-4 text-2xl">{p.name}</h2>
				<p class="text-sm">{p.description}</p>
			</a>
		{/each}
	</div>
</main>
