<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Insult Sword Fighting — Hub</title>
</svelte:head>

<main
	class="pixel-screen relative min-h-screen w-full overflow-hidden"
	style="background:
		radial-gradient(ellipse at 50% 25%, #2b3d75 0%, #14224a 35%, #0d1733 70%);"
>
	<!-- Procedural starfield: tiny radial gradients sprinkled across the sky.
	     Cheap, no asset dependency, scales nicely. -->
	<div
		class="pointer-events-none absolute inset-0 opacity-80"
		style="background-image:
			radial-gradient(1px 1px at 12% 18%, #f5e6c8 100%, transparent),
			radial-gradient(1px 1px at 28% 9%, #f5e6c8 100%, transparent),
			radial-gradient(1.5px 1.5px at 41% 22%, #ffffff 100%, transparent),
			radial-gradient(1px 1px at 56% 11%, #f5e6c8 100%, transparent),
			radial-gradient(1.5px 1.5px at 67% 6%, #ffffff 100%, transparent),
			radial-gradient(1px 1px at 79% 19%, #f5e6c8 100%, transparent),
			radial-gradient(1px 1px at 88% 8%, #f5e6c8 100%, transparent),
			radial-gradient(1px 1px at 7% 33%, #b9a070 100%, transparent),
			radial-gradient(1.5px 1.5px at 91% 28%, #ffffff 100%, transparent),
			radial-gradient(1px 1px at 33% 38%, #b9a070 100%, transparent);
		background-size: 100% 100%;"
	></div>

	<!-- Moon -->
	<div
		class="pointer-events-none absolute top-12 right-16 h-20 w-20 rounded-full"
		style="background: radial-gradient(circle at 35% 35%, #fff8c8, #f5c542 60%, #b9a070 100%);
			box-shadow: 0 0 40px rgba(245,197,66,0.35);"
	></div>

	<!-- Sea silhouette: solid darker stripe at the bottom -->
	<div
		class="pointer-events-none absolute right-0 bottom-0 left-0 h-1/3"
		style="background: linear-gradient(to bottom, transparent, rgba(11,16,40,0.95) 60%, #06091a 100%);"
	></div>

	<div class="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col p-6">
		<!-- Top bar: player badge -->
		<header class="flex justify-end">
			<div class="pixel-frame px-3 py-2 text-right" style="--card: rgba(13,23,51,0.9);">
				<div class="font-pixel text-[10px] tracking-wide" style="color: var(--muted-foreground);">
					CAPTAIN
				</div>
				<div class="font-pixel text-xs" style="color: var(--primary);">
					{data.displayName}
				</div>
				<div class="mt-1 text-base" style="color: var(--foreground);">
					🏆 {data.wins} / {data.totalChallenges}
				</div>
			</div>
		</header>

		<!-- Hero title -->
		<section class="my-auto flex flex-col items-center gap-4 text-center">
			<h1
				class="font-pixel text-2xl leading-snug tracking-wider sm:text-3xl md:text-4xl"
				style="color: var(--primary); text-shadow: 4px 4px 0 #000, 8px 8px 0 var(--secondary);"
			>
				INSULT<br />SWORD<br />FIGHTING
			</h1>
			<p
				class="font-body text-xl tracking-wide italic"
				style="color: var(--foreground); text-shadow: 2px 2px 0 #000;"
			>
				«Combatti come un contadino.»
			</p>
		</section>

		<!-- Menu -->
		<nav class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
			<a href="/play" class="pixel-button text-center no-underline" data-sveltekit-preload-data>
				⚔ &nbsp; PLAY
			</a>
			<a href="/tutorial" class="pixel-button text-center no-underline" data-sveltekit-preload-data>
				📜 &nbsp; TUTORIAL
			</a>
			<a href="/pool" class="pixel-button text-center no-underline" data-sveltekit-preload-data>
				🗡 &nbsp; ARSENAL
			</a>
			<a
				href="/leaderboard"
				class="pixel-button text-center no-underline"
				data-sveltekit-preload-data
			>
				☠ &nbsp; LEADERBOARD
			</a>
		</nav>

		<footer class="text-center">
			<a
				href="/login"
				class="font-body text-sm underline opacity-70 hover:opacity-100"
				style="color: var(--muted-foreground);"
			>
				Cambia personaggio
			</a>
		</footer>
	</div>
</main>
