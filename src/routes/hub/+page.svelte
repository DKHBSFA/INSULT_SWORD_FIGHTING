<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Insult Sword Fighting — Hub</title>
</svelte:head>

<main
	class="pixel-screen relative min-h-screen w-full overflow-hidden bg-cover bg-center"
	style="background-image: url('/assets/scenes/ship_deck_night/bg.svg')"
>
	<!-- Foreground silhouette overlays the painted background. -->
	<img
		src="/assets/scenes/ship_deck_night/fg.svg"
		alt=""
		class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
	/>

	<!-- Vignette + bottom fade so the menu chrome is always readable over any scene. -->
	<div
		class="pointer-events-none absolute inset-0"
		style="background:
			radial-gradient(ellipse at center, transparent 30%, rgba(13,23,51,0.85) 100%),
			linear-gradient(to bottom, transparent 50%, rgba(13,23,51,0.95) 100%);"
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
