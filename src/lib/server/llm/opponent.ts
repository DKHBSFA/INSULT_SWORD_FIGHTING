import { runWorkersAI, type GatewayEnv } from './gateway';
import { withRetry, withTimeout } from './retry';
import { INSULT_MAX_CHARS } from '../../shared/validation';
import { buildAttackerSystemPrompt } from './prompts/attacker';
import { buildDefenderSystemPrompt } from './prompts/defender';
import type { Difficulty } from '../../shared/difficulty';

const OPPONENT_MODEL = '@cf/mistralai/mistral-small-3.1-24b-instruct';

export type OpponentInput = {
	role: 'attacker' | 'defender';
	personaDescription: string;
	fewShot: { kind: 'attack' | 'defense'; text: string }[];
	fewShotPairs?: { attack: string; defense: string }[];
	lastUserText: string;
	mirrorLanguage: 'en' | 'it';
	difficulty: Difficulty;
};

function buildSystemPrompt(input: OpponentInput): string {
	if (input.role === 'attacker') {
		return buildAttackerSystemPrompt({
			personaDescription: input.personaDescription,
			mirrorLanguage: input.mirrorLanguage,
			difficulty: input.difficulty
		});
	}
	return buildDefenderSystemPrompt({
		personaDescription: input.personaDescription,
		mirrorLanguage: input.mirrorLanguage,
		difficulty: input.difficulty
	});
}

function buildUserPrompt(input: OpponentInput): string {
	const lang = input.mirrorLanguage;
	const lines: string[] = [];

	const pairs = input.fewShotPairs ?? [];
	if (pairs.length > 0) {
		lines.push(
			lang === 'it'
				? 'Riferimento di stile (NON copiare, solo imitare ritmo/lessico/ironia):'
				: 'Style reference (DO NOT copy, only imitate rhythm/lexicon/irony):'
		);
		for (const p of pairs.slice(0, 5)) {
			lines.push(`  • attacco "${p.attack}" — replica "${p.defense}"`);
		}
		lines.push('');
	}

	if (input.role === 'defender') {
		const matchHint = pairs.find(
			(p) => p.attack.toLowerCase().trim() === input.lastUserText.toLowerCase().trim()
		);
		lines.push(
			lang === 'it'
				? `Avversario ti attacca con: <user_attack>${input.lastUserText}</user_attack>`
				: `Opponent attacks you with: <user_attack>${input.lastUserText}</user_attack>`
		);
		if (matchHint) {
			lines.push(
				lang === 'it'
					? `Caso speciale: questo attacco corrisponde esattamente a un attacco di riferimento. La replica canonica è "${matchHint.defense}". USA esattamente quella replica.`
					: `Special case: this attack matches a reference attack exactly. The canonical reply is "${matchHint.defense}". USE that exact reply.`
			);
		} else {
			lines.push(
				lang === 'it'
					? "Scrivi SOLO la tua replica (una frase originale, NON copiata dagli esempi). Deve agganciarsi a una parola o immagine specifica dell'attacco avversario."
					: "Write ONLY your reply (one original sentence, NOT copied from examples). It must hook onto a specific word or image from the opponent's attack."
			);
		}
	} else {
		lines.push(
			lang === 'it'
				? 'Scrivi SOLO un nuovo attacco (una frase originale, NON copiata dagli esempi) nel registro del tuo personaggio. Una sola frase, niente preamboli, niente label.'
				: 'Write ONLY a fresh attack (one original sentence, NOT copied from examples) in your character voice. One sentence only, no preamble, no labels.'
		);
	}
	return lines.join('\n');
}

function postProcess(rawResponse: string, input: OpponentInput): string {
	let text = rawResponse.trim();
	text = text.split(/\n+/)[0]?.trim() ?? text;
	const labelRx =
		/^(l[''']?insulto[^:]*:|l[''']?attacco[^:]*:|la\s+tua\s+replica[^:]*:|un\s+nuovo\s+attacco[^:]*:|risposta\s+giusta|risposta\s+canonica|replica\s+canonica|defenditi\s+con|attacca\s+con|attacco|attack|difesa|defense|reply|risposta|replica|atk|def)\s*[:\-—]?\s*["'«]?\s*/i;
	for (let i = 0; i < 3 && labelRx.test(text); i++) text = text.replace(labelRx, '');
	const inlineReplicaRx = /\s*[—–-]\s*(replica|reply|risposta)\s*[:\-—]\s*["'«]?[^»"']*["'»]?\s*$/i;
	text = text.replace(inlineReplicaRx, '').trim();
	text = text.replace(/^(ah[,!]?\s*|ecco[,!]?\s*|certo[,!]?\s*|allora[,!]?\s*)/i, '');
	text = text.replace(/^[«"'`]+|[»"'`]+$/g, '').trim();
	if (text.length > INSULT_MAX_CHARS) text = text.slice(0, INSULT_MAX_CHARS);
	if (text.length < 8) {
		throw new Error('opponent produced empty/too-short output after stripping');
	}
	if (/[.$#]\w+\(|\bfunction\s+\w+|\.\w+\(\s*\)/.test(text)) {
		throw new Error('opponent emitted code-like syntax');
	}
	if (input.mirrorLanguage === 'it') {
		const calqueRx = /\b(barco|defenza|scurvo|possoo|dialetto\s+inglese)\b/i;
		if (calqueRx.test(text)) {
			throw new Error(`opponent used a known English calque: "${text.match(calqueRx)?.[0]}"`);
		}
	}

	const normalize = (s: string): string =>
		s
			.toLowerCase()
			.replace(/[^\p{L}\p{N}\s]/gu, '')
			.replace(/\s+/g, ' ')
			.trim();
	const norm = normalize(text);

	if (input.role === 'defender' && input.lastUserText) {
		const lastNorm = normalize(input.lastUserText);
		if (norm === lastNorm) {
			throw new Error('defender echoed the attack verbatim');
		}
		const attackWords = lastNorm.split(' ').filter((w) => w.length > 0);
		const replyWords = norm.split(' ').filter((w) => w.length > 0);
		const N = 6;
		if (attackWords.length >= N && replyWords.length >= N) {
			let sharedPrefix = 0;
			for (let i = 0; i < N; i++) {
				if (attackWords[i] === replyWords[i]) sharedPrefix++;
				else break;
			}
			if (sharedPrefix >= 4) {
				throw new Error(`defender clones attack opening (${sharedPrefix}/${N} prefix words match)`);
			}
		}
	}

	if (input.fewShotPairs && input.fewShotPairs.length > 0) {
		const matchHint =
			input.role === 'defender'
				? input.fewShotPairs.find((p) => normalize(p.attack) === normalize(input.lastUserText))
				: undefined;
		const allowedDefense = matchHint ? normalize(matchHint.defense) : null;
		for (const p of input.fewShotPairs) {
			const aN = normalize(p.attack);
			const dN = normalize(p.defense);
			if (norm === aN) throw new Error('opponent copied an example attack verbatim');
			if (norm === dN && norm !== allowedDefense) {
				throw new Error('opponent copied an example defense verbatim');
			}
		}
	}
	return text;
}

export async function generateOpponent(
	env: GatewayEnv,
	input: OpponentInput
): Promise<{ text: string; modelId: string }> {
	const sysPrompt = buildSystemPrompt(input);
	const userPrompt = buildUserPrompt(input);

	const text = await withRetry(
		async () => {
			const raw = await withTimeout(
				runWorkersAI<{
					response?: string;
					choices?: { message?: { content?: string } }[];
				}>(env, OPPONENT_MODEL, {
					messages: [
						{ role: 'system', content: sysPrompt },
						{ role: 'user', content: userPrompt }
					]
				}),
				60_000
			);
			const rawText = raw.response ?? raw.choices?.[0]?.message?.content ?? '';
			return postProcess(rawText, input);
		},
		{ maxAttempts: 4, baseDelayMs: 250 }
	);

	return { text, modelId: OPPONENT_MODEL };
}
