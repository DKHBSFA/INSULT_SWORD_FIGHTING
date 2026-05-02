<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { invalidateAll, goto } from '$app/navigation';
	import { TURN_TIMER_MS, MATCH_REGULAR_TURNS } from '$lib/shared/types';
	import type { Side, Judgment } from '$lib/shared/types';

	type PoolEntry = { id: string; text: string };
	type FeedbackCategory =
		| 'wrong_winner'
		| 'wrong_reasoning'
		| 'invented_content'
		| 'incoherent'
		| 'other';
	type ExpectedJudgment = 'attacker_wins' | 'defender_wins' | 'tie' | 'unsure';

	let { data } = $props();

	let feedbackOpen = $state(false);
	let feedbackTurnId = $state<string | null>(null);
	let feedbackCategory = $state<FeedbackCategory>('wrong_winner');
	let feedbackExpected = $state<ExpectedJudgment>('unsure');
	let feedbackComment = $state('');
	let feedbackSubmitting = $state(false);

	const FB_CATEGORY_LABEL: Record<FeedbackCategory, string> = {
		wrong_winner: 'Vincitore sbagliato',
		wrong_reasoning: 'Motivazione sbagliata',
		invented_content: 'Il giudice ha inventato contenuti non presenti',
		incoherent: 'Motivazione incoerente con il verdetto',
		other: 'Altro'
	};
	const FB_EXPECTED_LABEL: Record<ExpectedJudgment, string> = {
		attacker_wins: "Avrebbe dovuto vincere l'attaccante",
		defender_wins: 'Avrebbe dovuto vincere il difensore',
		tie: 'Avrebbe dovuto essere un pareggio',
		unsure: 'Non sono sicuro/a'
	};

	let phrase = $state('');
	let timer = $state(Math.floor(TURN_TIMER_MS / 1000));
	let submitting = $state(false);
	let lastResult = $state<{
		attacker: Side;
		attackText: string;
		defenseText: string;
		judgment: Judgment;
		reasoning: string | null;
		matchOver: boolean;
		matchWinner: Side | null;
		challengeOver: boolean;
	} | null>(null);
	let tab: 'yours' | 'free' = $state('free');
	let search = $state('');
	let pendingNpcAttack = $state<string | null>(null);
	let loadingPreview = $state(false);

	const role = $derived<'attacker' | 'defender'>(
		data.currentAttacker === 'user' ? 'attacker' : 'defender'
	);
	const poolKind = $derived<'attack' | 'defense'>(role === 'attacker' ? 'attack' : 'defense');
	const pool = $derived<PoolEntry[]>(
		(poolKind === 'attack' ? data.attackPool : data.defensePool) as PoolEntry[]
	);
	const filtered = $derived(
		pool.filter((p) => p.text.toLowerCase().includes(search.toLowerCase()))
	);

	const score = $derived(
		data.match
			? {
					user: data.match.scoreUser,
					opponent: data.match.scoreOpponent,
					ties: data.match.scoreTies
				}
			: { user: 0, opponent: 0, ties: 0 }
	);
	const turnsPlayed = $derived(score.user + score.opponent + score.ties);
	const matchOver = $derived(
		(lastResult?.matchOver ?? false) ||
			data.challenge?.status === 'completed' ||
			score.user > Math.floor(MATCH_REGULAR_TURNS / 2) ||
			score.opponent > Math.floor(MATCH_REGULAR_TURNS / 2)
	);
	const winner = $derived(
		(lastResult?.matchWinner ?? data.challenge?.winner ?? null) as Side | null
	);

	const timerActive = $derived(
		!!data.challenge &&
			!matchOver &&
			!submitting &&
			!loadingPreview &&
			(data.currentAttacker === 'user' || pendingNpcAttack !== null)
	);

	onMount(() => {
		const i = setInterval(() => {
			if (timerActive && timer > 0) timer--;
		}, 1000);
		return () => clearInterval(i);
	});

	let lastTimerTrigger = $state<string | null>(null);
	$effect(() => {
		const trigger =
			data.currentAttacker === 'opponent'
				? `opp:${pendingNpcAttack ?? ''}`
				: `user:${data.recentTurns[0]?.id ?? 'init'}`;
		if (pendingNpcAttack !== null || (data.currentAttacker === 'user' && !loadingPreview)) {
			if (trigger !== lastTimerTrigger) {
				lastTimerTrigger = trigger;
				timer = Math.floor(TURN_TIMER_MS / 1000);
			}
		}
	});

	async function fetchPreview() {
		if (!data.challenge || loadingPreview) return;
		if (matchOver || lastResult?.matchOver || lastResult?.challengeOver) {
			pendingNpcAttack = null;
			return;
		}
		if (data.currentAttacker !== 'opponent') {
			pendingNpcAttack = null;
			return;
		}
		loadingPreview = true;
		try {
			const res = await fetch(`/api/challenges/${data.challenge.id}/turn/preview`, {
				method: 'POST'
			});
			if (res.ok) {
				const body = (await res.json()) as { attacker: Side; attackText: string | null };
				pendingNpcAttack = body.attackText ?? null;
			}
		} finally {
			loadingPreview = false;
		}
	}

	$effect(() => {
		void data.currentAttacker;
		void data.challenge?.id;
		void data.recentTurns.length;
		fetchPreview();
	});

	async function submit() {
		if (!data.challenge || submitting || matchOver) return;
		if (phrase.trim().length === 0) return;
		submitting = true;
		const idemKey = crypto.randomUUID();
		const res = await fetch(`/api/challenges/${data.challenge.id}/turn`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idemKey },
			body: JSON.stringify({
				text: phrase,
				source: tab === 'yours' ? 'personal_pool' : 'free_text'
			})
		});
		if (!res.ok) {
			submitting = false;
			lastResult = null;
			alert(`Errore turno: ${res.status} ${await res.text()}`);
			return;
		}
		const body = (await res.json()) as {
			attacker: Side;
			attackText: string;
			defenseText: string;
			judgment: Judgment;
			reasoning: string | null;
			matchOver: boolean;
			matchWinner: Side | null;
			challengeOver: boolean;
		};
		lastResult = body;
		phrase = '';
		timer = Math.floor(TURN_TIMER_MS / 1000);
		pendingNpcAttack = null;
		await invalidateAll();
		submitting = false;
	}

	async function postNewChallenge(): Promise<Response> {
		return fetch('/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mode: 'match',
				opponentUserId: data.persona!.userId,
				format: 'bo1'
			})
		});
	}

	async function newChallenge() {
		if (!data.persona) return;
		let res = await postNewChallenge();
		if (res.status === 201) {
			const { id } = (await res.json()) as { id: string };
			goto(`/play/${data.persona.id}/match/${id}`);
			return;
		}
		if (res.status === 409) {
			const { activeChallengeId } = (await res.json()) as { activeChallengeId?: string };
			const stuckId = activeChallengeId ?? data.challenge?.id;
			if (stuckId) {
				await fetch(`/api/challenges/${stuckId}/abandon`, { method: 'POST' });
				res = await postNewChallenge();
				if (res.status === 201) {
					const { id } = (await res.json()) as { id: string };
					goto(`/play/${data.persona.id}/match/${id}`);
					return;
				}
			}
		}
		alert(`Errore creazione sfida: ${res.status} ${await res.text()}`);
	}

	async function toggleLanguage() {
		const next = data.userLang === 'it' ? 'en' : 'it';
		await fetch('/api/profile', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ language: next })
		});
		await invalidateAll();
	}

	function openFeedback(turnId: string | null) {
		feedbackTurnId = turnId;
		feedbackCategory = 'wrong_winner';
		feedbackExpected = 'unsure';
		feedbackComment = '';
		feedbackOpen = true;
	}

	async function submitFeedback() {
		if (!data.challenge || feedbackSubmitting) return;
		feedbackSubmitting = true;
		try {
			const res = await fetch(`/api/challenges/${data.challenge.id}/feedback`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					turnId: feedbackTurnId,
					category: feedbackCategory,
					expectedJudgment: feedbackExpected === 'unsure' ? undefined : feedbackExpected,
					comment: feedbackComment.trim() || undefined
				})
			});
			if (!res.ok) {
				alert(`Errore segnalazione: ${res.status}`);
				return;
			}
			const { githubIssueUrl } = (await res.json()) as { githubIssueUrl: string };
			feedbackOpen = false;
			window.open(githubIssueUrl, '_blank', 'noopener');
		} finally {
			feedbackSubmitting = false;
		}
	}

	function fmtJudgment(j: Judgment, attacker: Side): string {
		if (j === 'tie') return 'pareggio';
		if (j === 'attacker_wins')
			return attacker === 'user' ? 'hai vinto il turno' : 'hai perso il turno';
		return attacker === 'user' ? 'hai perso il turno' : 'hai vinto il turno';
	}
</script>

<main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-4">
	{#if !data.challenge || !data.persona}
		<p class="text-center">Sfida non trovata.</p>
	{:else}
		<header class="flex items-baseline justify-between border-b pb-3">
			<div>
				<h1 class="text-2xl font-bold">Tu vs {data.persona.name}</h1>
				<p class="text-muted-foreground line-clamp-2 text-sm">{data.persona.description}</p>
			</div>
			<div class="flex items-start gap-3 text-right text-sm whitespace-nowrap">
				<button
					type="button"
					class="hover:bg-muted rounded border px-2 py-1 font-mono text-xs uppercase"
					onclick={toggleLanguage}
					title="Cambia lingua"
				>
					{data.userLang}
				</button>
				<div>
					<div class="font-mono text-2xl">
						<span class="text-emerald-600">{score.user}</span>
						—
						<span class="text-rose-600">{score.opponent}</span>
					</div>
					<div class="text-muted-foreground text-xs">
						pareggi: {score.ties} · turno {turnsPlayed + 1}/{MATCH_REGULAR_TURNS}
					</div>
				</div>
			</div>
		</header>

		<div
			class="relative h-64 overflow-hidden rounded-lg border bg-cover bg-center"
			style="background-image: url('/assets/scenes/ship_deck_night/bg.svg')"
		>
			<img
				src="/assets/scenes/ship_deck_night/fg.svg"
				alt=""
				class="pointer-events-none absolute inset-0 h-full w-full object-cover"
			/>
			<img
				src={data.persona.spriteSetUrl}
				alt={data.persona.name}
				class="absolute right-12 bottom-2 h-44 drop-shadow-xl"
			/>
			{#if pendingNpcAttack}
				<div
					class="absolute top-3 right-3 max-w-[55%] rounded-lg border-2 border-rose-500 bg-white/95 px-3 py-2 text-sm font-semibold text-rose-900 shadow-lg before:absolute before:right-12 before:-bottom-2 before:h-0 before:w-0 before:border-x-8 before:border-t-8 before:border-x-transparent before:border-t-rose-500"
				>
					{data.persona.name} ti attacca: «{pendingNpcAttack}»
				</div>
			{:else if loadingPreview}
				<div class="absolute top-3 right-3 rounded-lg bg-white/80 px-3 py-2 text-sm">
					{data.persona.name} sta caricando un attacco…
				</div>
			{:else if lastResult && lastResult.attacker === 'opponent'}
				<div
					class="absolute top-3 right-3 max-w-[55%] rounded-lg bg-white/95 px-3 py-2 text-sm shadow-lg before:absolute before:right-12 before:-bottom-2 before:h-0 before:w-0 before:border-x-8 before:border-t-8 before:border-x-transparent before:border-t-white"
				>
					«{lastResult.attackText}»
				</div>
			{:else if lastResult && lastResult.attacker === 'user'}
				<div
					class="absolute top-3 right-3 max-w-[55%] rounded-lg bg-zinc-900/95 px-3 py-2 text-sm text-yellow-200 shadow-lg"
				>
					{data.persona.name} si difende: «{lastResult.defenseText}»
				</div>
			{/if}
		</div>

		{#if matchOver}
			<section
				class="rounded-lg border-2 p-6 text-center"
				class:border-emerald-500={winner === 'user'}
				class:border-rose-500={winner === 'opponent'}
			>
				<p class="text-3xl font-bold">
					{winner === 'user' ? 'Hai vinto la sfida!' : 'Hai perso la sfida.'}
				</p>
				<p class="text-muted-foreground mt-1">
					Punteggio finale: {score.user}—{score.opponent} (pareggi {score.ties})
				</p>
				<div class="mt-4 flex flex-wrap justify-center gap-2">
					<Button onclick={newChallenge}>Nuova sfida</Button>
					<Button
						variant="outline"
						onclick={() => window.open(`/api/challenges/${data.challenge!.id}/export`, '_blank')}
					>
						Esporta in .md
					</Button>
					<Button variant="outline" onclick={() => openFeedback(null)}>Segnala il giudizio</Button>
				</div>
			</section>
		{:else}
			<section class="bg-muted rounded-lg p-4">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-lg font-semibold">
						{#if role === 'attacker'}
							🗡️ Tocca a te attaccare
						{:else}
							🛡️ Tocca a te difendere
						{/if}
					</span>
					<span
						class="font-mono"
						class:text-yellow-700={timerActive}
						class:text-zinc-400={!timerActive}
						title={timerActive
							? 'Timer attivo'
							: loadingPreview
								? `In attesa dell'attacco di ${data.persona.name}…`
								: 'Timer in pausa'}
					>
						⏱ {timer}s{timerActive ? '' : ' ⏸'}
					</span>
				</div>
				<p class="text-muted-foreground text-sm">
					{#if role === 'attacker'}
						Scrivi un insulto contro {data.persona.name}.
					{:else if pendingNpcAttack}
						Rispondi all'attacco di {data.persona.name} qui sopra.
					{:else}
						{data.persona.name} sta preparando un attacco…
					{/if}
				</p>

				<div class="mt-3 mb-2 flex gap-2">
					<Button
						onclick={() => (tab = 'yours')}
						variant={tab === 'yours' ? 'default' : 'outline'}
						size="sm"
					>
						Dal tuo arsenale ({pool.length})
					</Button>
					<Button
						onclick={() => (tab = 'free')}
						variant={tab === 'free' ? 'default' : 'outline'}
						size="sm"
					>
						Testo libero
					</Button>
				</div>

				{#if tab === 'yours'}
					<Input bind:value={search} placeholder="Cerca…" class="mb-2" />
					<div class="max-h-40 overflow-y-auto rounded border">
						{#if filtered.length === 0}
							<p class="text-muted-foreground p-2 text-sm">
								Nessuna voce {poolKind === 'attack' ? "d'attacco" : 'di difesa'} nel tuo arsenale.
							</p>
						{:else}
							{#each filtered as e (e.id)}
								<button
									type="button"
									class="hover:bg-accent block w-full px-2 py-1 text-left text-sm"
									class:bg-accent={phrase === e.text}
									onclick={() => (phrase = e.text)}
								>
									{e.text}
								</button>
							{/each}
						{/if}
					</div>
					{#if phrase}
						<p class="mt-2 text-sm">Selezionato: <em>{phrase}</em></p>
					{/if}
				{:else}
					<Input
						bind:value={phrase}
						maxlength={280}
						placeholder={role === 'attacker' ? 'Il tuo attacco…' : 'La tua difesa…'}
						class="mb-2"
					/>
				{/if}

				<Button onclick={submit} disabled={submitting || phrase.trim().length === 0} class="mt-2">
					{submitting ? 'Invio…' : role === 'attacker' ? 'Attacca' : 'Difendi'}
				</Button>
			</section>
		{/if}

		{#if lastResult}
			<section class="rounded-lg border p-4">
				<h2 class="mb-2 font-semibold">
					Ultimo turno: {fmtJudgment(lastResult.judgment, lastResult.attacker)}
				</h2>
				<dl class="space-y-2 text-sm">
					<div>
						<dt class="text-muted-foreground">
							Attacco di {lastResult.attacker === 'user' ? 'te' : data.persona.name}:
						</dt>
						<dd class="italic">«{lastResult.attackText}»</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">
							Difesa di {lastResult.attacker === 'user' ? data.persona.name : 'te'}:
						</dt>
						<dd class="italic">«{lastResult.defenseText}»</dd>
					</div>
					{#if lastResult.reasoning}
						<div>
							<dt class="text-muted-foreground">Giudizio:</dt>
							<dd>{lastResult.reasoning}</dd>
						</div>
					{/if}
				</dl>
			</section>
		{/if}

		{#if data.recentTurns.length > 0}
			<section>
				<h2 class="mb-2 text-sm font-semibold">Cronologia</h2>
				<ul class="space-y-1 text-xs">
					{#each data.recentTurns as t (t.id)}
						<li
							class="border-l-2 pl-2"
							class:border-emerald-500={(t.attacker === 'user' && t.judgment === 'attacker_wins') ||
								(t.attacker === 'opponent' && t.judgment === 'defender_wins')}
							class:border-rose-500={(t.attacker === 'opponent' &&
								t.judgment === 'attacker_wins') ||
								(t.attacker === 'user' && t.judgment === 'defender_wins')}
							class:border-zinc-400={t.judgment === 'tie'}
						>
							<div class="flex items-center justify-between gap-2">
								<div>
									<strong>T{t.turnNumber}</strong> · {t.attacker === 'user'
										? 'tu attacchi'
										: `${data.persona.name} attacca`} → {fmtJudgment(
										t.judgment,
										t.attacker as Side
									)}
								</div>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground text-[10px] underline"
									onclick={() => openFeedback(t.id)}
									title="Segnala questo turno"
								>
									segnala
								</button>
							</div>
							<div class="text-muted-foreground truncate">
								«{t.attackText}» / «{t.defenseText ?? ''}»
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if feedbackOpen}
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
				role="dialog"
				aria-modal="true"
				tabindex="-1"
				onclick={(e) => {
					if (e.target === e.currentTarget) feedbackOpen = false;
				}}
				onkeydown={(e) => {
					if (e.key === 'Escape') feedbackOpen = false;
				}}
			>
				<div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
					<h2 class="mb-1 text-xl font-bold">Segnala il giudizio</h2>
					<p class="text-muted-foreground mb-4 text-sm">
						La segnalazione apre una issue su GitHub per migliorare il modello.
					</p>

					<label class="mb-3 block">
						<span class="mb-1 block text-sm font-semibold">Tipo di problema</span>
						<select
							bind:value={feedbackCategory}
							class="w-full rounded border bg-white px-2 py-1 text-sm"
						>
							{#each Object.entries(FB_CATEGORY_LABEL) as [k, v] (k)}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</label>

					<label class="mb-3 block">
						<span class="mb-1 block text-sm font-semibold">Esito atteso (facoltativo)</span>
						<select
							bind:value={feedbackExpected}
							class="w-full rounded border bg-white px-2 py-1 text-sm"
						>
							{#each Object.entries(FB_EXPECTED_LABEL) as [k, v] (k)}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</label>

					<label class="mb-4 block">
						<span class="mb-1 block text-sm font-semibold">Commento (facoltativo)</span>
						<textarea
							bind:value={feedbackComment}
							maxlength={2000}
							rows={4}
							placeholder="Descrivi cosa secondo te il giudice ha sbagliato"
							class="w-full rounded border bg-white p-2 text-sm"
						></textarea>
					</label>

					<div class="flex justify-end gap-2">
						<Button variant="outline" onclick={() => (feedbackOpen = false)}>Annulla</Button>
						<Button onclick={submitFeedback} disabled={feedbackSubmitting}>
							{feedbackSubmitting ? 'Invio…' : 'Apri issue su GitHub'}
						</Button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</main>
