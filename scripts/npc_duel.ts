/**
 * Standalone NPC-vs-NPC duel using only the LLM modules.
 * Run: pnpm exec tsx scripts/npc_duel.ts
 */
import { readFileSync } from 'node:fs';
import { generateOpponent } from '../src/lib/server/llm/opponent';
import { judgeTurn } from '../src/lib/server/llm/judge';
import { makeOllamaAi } from '../src/lib/server/llm/ollama-adapter';
import { seedsByPersona } from '../db/seed/pools';
import { personas } from '../db/seed/personas';
import type { Side, Judgment } from '../src/lib/shared/types';

function loadDevVars(): Record<string, string> {
	const txt = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
	const out: Record<string, string> = {};
	for (const line of txt.split(/\r?\n/)) {
		const m = line.match(/^([A-Z_]+)=(.*)$/);
		if (m) out[m[1]!] = m[2]!;
	}
	return out;
}

const vars = loadDevVars();
const baseUrl = vars.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1';
const model = vars.OLLAMA_MODEL ?? 'qwen2.5-coder:3b-instruct';
const ai = makeOllamaAi(baseUrl, model);
const env = { AI: ai, ENVIRONMENT: 'development' } as never;

const lang = 'it' as const;
const brutus = personas.find((p) => p.id === 'old_pirate_brutus')!;
const reginald = personas.find((p) => p.id === 'haughty_nobleman')!;

const brutusPairs = seedsByPersona[brutus.id]![lang]!;
const reginaldPairs = seedsByPersona[reginald.id]![lang]!;

type Persona = typeof brutus;
async function generateAttack(p: Persona, pairs: typeof brutusPairs): Promise<string> {
	const r = await generateOpponent(env, {
		role: 'attacker',
		personaDescription: p.descriptionIt!,
		fewShot: [],
		fewShotPairs: pairs.slice(0, 5),
		lastUserText: '',
		mirrorLanguage: lang
	});
	return r.text;
}

async function generateDefense(
	p: Persona,
	pairs: typeof brutusPairs,
	attackText: string
): Promise<string> {
	const r = await generateOpponent(env, {
		role: 'defender',
		personaDescription: p.descriptionIt!,
		fewShot: [],
		fewShotPairs: pairs.slice(0, 5),
		lastUserText: attackText,
		mirrorLanguage: lang
	});
	return r.text;
}

function nextAttacker(prev: Side, j: Exclude<Judgment, 'timeout'>): Side {
	if (j === 'tie') return Math.random() < 0.5 ? 'user' : 'opponent';
	if (j === 'attacker_wins') return prev;
	return prev === 'user' ? 'opponent' : 'user';
}

(async () => {
	console.log('# Duello NPC: Brutus vs Lord Reginald Pemberton (lingua: it)\n');
	let attacker: Side = Math.random() < 0.5 ? 'user' : 'opponent';
	let scoreBrutus = 0;
	let scoreReginald = 0;
	let ties = 0;
	const TURNS = 5;

	for (let t = 1; t <= TURNS; t++) {
		const brutusAttacks = attacker === 'user';
		const atkPersona = brutusAttacks ? brutus : reginald;
		const defPersona = brutusAttacks ? reginald : brutus;
		const atkPairs = brutusAttacks ? brutusPairs : reginaldPairs;
		const defPairs = brutusAttacks ? reginaldPairs : brutusPairs;

		console.log(`## Turno ${t} — attacca ${atkPersona.name}`);
		let atk: string;
		try {
			atk = await generateAttack(atkPersona, atkPairs);
		} catch (e) {
			console.log(`- ATTACCO (${atkPersona.name}): [GENERATION FAILED: ${(e as Error).message}]`);
			continue;
		}
		console.log(`- ATTACCO (${atkPersona.name}): «${atk}»`);
		let def: string;
		try {
			def = await generateDefense(defPersona, defPairs, atk);
		} catch (e) {
			console.log(`- DIFESA (${defPersona.name}): [GENERATION FAILED: ${(e as Error).message}]`);
			continue;
		}
		console.log(`- DIFESA  (${defPersona.name}): «${def}»`);
		let verdict;
		try {
			verdict = await judgeTurn(env, {
				attackText: atk,
				defenseText: def,
				language: lang
			});
		} catch (e) {
			console.log(`- GIUDIZIO: [JUDGE FAILED: ${(e as Error).message}]`);
			continue;
		}
		const winnerLabel =
			verdict.judgment === 'tie'
				? 'pareggio'
				: verdict.judgment === 'attacker_wins'
					? `${atkPersona.name} vince`
					: `${defPersona.name} vince`;
		console.log(`- ESITO: ${winnerLabel}`);
		console.log(`- GIUDIZIO: ${verdict.reasoning ?? '(no reasoning)'}\n`);

		if (verdict.judgment === 'tie') ties++;
		else if (
			(verdict.judgment === 'attacker_wins' && brutusAttacks) ||
			(verdict.judgment === 'defender_wins' && !brutusAttacks)
		)
			scoreBrutus++;
		else scoreReginald++;

		attacker = nextAttacker(attacker, verdict.judgment as Exclude<Judgment, 'timeout'>);
	}

	console.log(
		`---\n**Score finale**: Brutus ${scoreBrutus} — Reginald ${scoreReginald} (pareggi: ${ties})`
	);
})().catch((e) => {
	console.error('FATAL:', e);
	process.exit(1);
});
