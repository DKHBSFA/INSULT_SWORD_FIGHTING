import { runWorkersAI, type GatewayEnv } from './gateway';
import { withRetry, withTimeout } from './retry';
import { buildJudgeSystemPrompt } from './prompts/judge';

export type Judgment = 'attacker_wins' | 'defender_wins' | 'tie';
export type JudgeResult = { judgment: Judgment; reasoning?: string; modelId: string };

const JUDGE_MODEL = '@cf/mistralai/mistral-small-3.1-24b-instruct';

function reasoningCoherent(judgment: Judgment, reasoning: string, lang: 'en' | 'it'): boolean {
	const r = reasoning.toLowerCase().trim();
	const winnerLossPatterns = {
		it: {
			loserWordsForAttacker: [
				'il difensore vince',
				'la difesa vince',
				'la difesa ribalta',
				'il difensore ribalta',
				'la difesa supera',
				'il difensore supera'
			],
			loserWordsForDefender: [
				"l'attaccante vince",
				"l'attacco vince",
				"l'attaccante supera",
				"l'attacco supera"
			]
		},
		en: {
			loserWordsForAttacker: [
				'the defender wins',
				'the defense wins',
				'the defense flips',
				'the defender flips',
				'the defender outwits',
				'the defense outwits'
			],
			loserWordsForDefender: [
				'the attacker wins',
				'the attack wins',
				'the attacker outwits',
				'the attack outwits'
			]
		}
	};
	const tab = winnerLossPatterns[lang];
	if (judgment === 'attacker_wins') {
		return !tab.loserWordsForAttacker.some((p) => r.includes(p));
	}
	if (judgment === 'defender_wins') {
		return !tab.loserWordsForDefender.some((p) => r.includes(p));
	}
	return true;
}

export async function judgeTurn(
	env: GatewayEnv,
	input: { attackText: string; defenseText: string; language?: 'en' | 'it' }
): Promise<JudgeResult> {
	const lang = input.language ?? 'en';
	const userPrompt = `<user_attack>${input.attackText}</user_attack>\n<user_defense>${input.defenseText}</user_defense>\nReply with only the JSON object.`;

	return withRetry(
		async () => {
			const raw = await withTimeout(
				runWorkersAI<{
					response?: string;
					choices?: { message?: { content?: string } }[];
				}>(env, JUDGE_MODEL, {
					messages: [
						{ role: 'system', content: buildJudgeSystemPrompt(lang) },
						{ role: 'user', content: userPrompt }
					]
				}),
				30_000
			);
			const rawText = raw.response ?? raw.choices?.[0]?.message?.content ?? '';
			const text = rawText.trim();
			const match = text.match(/\{[\s\S]*\}/);
			if (!match) throw new Error('judge response not JSON');
			const parsed = JSON.parse(match[0]) as { judgment?: unknown; reasoning?: unknown };
			if (
				typeof parsed.judgment !== 'string' ||
				!['attacker_wins', 'defender_wins', 'tie'].includes(parsed.judgment)
			)
				throw new Error('invalid judgment value');
			const judgment = parsed.judgment as Judgment;
			const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning : '';
			if (reasoning && !reasoningCoherent(judgment, reasoning, lang)) {
				throw new Error(
					`reasoning subject does not match judgment "${judgment}": "${reasoning.slice(0, 60)}"`
				);
			}
			const result: JudgeResult = { judgment, modelId: JUDGE_MODEL };
			if (reasoning) result.reasoning = reasoning;
			return result;
		},
		{ maxAttempts: 4, baseDelayMs: 250 }
	);
}
