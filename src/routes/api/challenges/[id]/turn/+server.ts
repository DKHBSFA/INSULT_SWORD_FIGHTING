import type { RequestHandler } from './$types';
import { makeDb } from '$lib/server/db/client';
import {
	challenges,
	matches,
	turns,
	opponentPersonas,
	userProfile
} from '../../../../../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { newUlid } from '$lib/server/db/ulid';
import { judgeTurn } from '$lib/server/llm/judge';
import { generateNpcLlm, pickNpcDeterministic } from '$lib/server/game/npc';
import { applyLearning } from '$lib/server/game/learning';
import { saveEntryWithBackfill } from '$lib/server/pool/save';
import { getVectorizeBinding } from '$lib/server/pool/vectorize-mock';
import { validateInsultText } from '$lib/shared/validation';
import { nextAttacker, isMatchOver, matchWinner } from '$lib/server/game/state';
import { readDevUserId } from '$lib/server/auth/dev-user';
import type { Judgment, Side } from '$lib/shared/types';
import type { Difficulty } from '$lib/shared/difficulty';

type AttackSource = 'personal_pool' | 'free_text' | 'opponent_npc';
type DefenseSource = 'personal_pool' | 'free_text' | 'opponent_npc' | 'timeout';

export const POST: RequestHandler = async ({ request, params, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });

	const idemKey = request.headers.get('Idempotency-Key');
	if (!idemKey) return new Response('Idempotency-Key header required', { status: 400 });

	const cached = await env.KV.get(`turn-idem:${params.id}:${idemKey}`);
	if (cached)
		return new Response(cached, {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});

	const body = (await request.json()) as { text: string; source: AttackSource };
	const text = validateInsultText(body.text);

	const ch = await db.select().from(challenges).where(eq(challenges.id, params.id)).limit(1);
	if (!ch[0] || ch[0].userId !== userId) return new Response('not found', { status: 404 });
	if (ch[0].status !== 'in_progress') return new Response('challenge not active', { status: 409 });

	const persona = await db
		.select()
		.from(opponentPersonas)
		.where(eq(opponentPersonas.userId, ch[0].opponentUserId))
		.limit(1);
	if (!persona[0]) return new Response('persona not found', { status: 500 });

	const profile = await db
		.select()
		.from(userProfile)
		.where(eq(userProfile.userId, userId))
		.limit(1);
	const lang: 'en' | 'it' = profile[0]?.language ?? 'en';

	let curMatch = (
		await db
			.select()
			.from(matches)
			.where(and(eq(matches.challengeId, ch[0].id), eq(matches.status, 'in_progress')))
			.orderBy(desc(matches.matchIndex))
			.limit(1)
	)[0];
	if (!curMatch) {
		const id = newUlid();
		const firstAttacker: Side = Math.random() < 0.5 ? 'user' : 'opponent';
		await db.insert(matches).values({
			id,
			challengeId: ch[0].id,
			matchIndex: 1,
			firstAttacker,
			status: 'in_progress',
			startedAt: Date.now()
		});
		curMatch = (await db.select().from(matches).where(eq(matches.id, id)).limit(1))[0]!;
	}

	const lastTurn = (
		await db
			.select()
			.from(turns)
			.where(eq(turns.matchId, curMatch.id))
			.orderBy(desc(turns.turnNumber))
			.limit(1)
	)[0];
	const attacker: Side = lastTurn
		? nextAttacker(lastTurn.attacker as Side, lastTurn.judgment as Exclude<Judgment, 'timeout'>)
		: (curMatch.firstAttacker as Side);

	let attackText = text;
	let defenseText: string;
	let opponentModel: string | null = null;

	const isAdaptive = persona[0].poolMode === 'adaptive';
	const llmEnv = {
		...env,
		POOL_VECTORS: getVectorizeBinding(env)
	} as Parameters<typeof generateNpcLlm>[1];

	if (attacker === 'user') {
		if (ch[0].mode === 'tutorial' || !isAdaptive) {
			const det = await pickNpcDeterministic(db, {
				npcUserId: ch[0].opponentUserId,
				kind: 'defense',
				exclude: [],
				language: lang
			});
			defenseText = det?.text ?? '';
		} else {
			const npc = await generateNpcLlm(db, llmEnv, {
				npcUserId: ch[0].opponentUserId,
				personaDescription: persona[0].description,
				personaDescriptionIt: persona[0].descriptionIt,
				role: 'defender',
				lastUserText: text,
				mirrorLanguage: lang,
				difficulty: ch[0].difficulty as Difficulty
			});
			defenseText = npc.text;
			opponentModel = npc.modelId;
		}
	} else {
		const turnNumberToBe = (lastTurn?.turnNumber ?? 0) + 1;
		const pendingKey = `turn-attack-pending:${ch[0].id}:${turnNumberToBe}`;
		const pending = await env.KV.get(pendingKey);
		if (pending) {
			attackText = pending;
			await env.KV.delete(pendingKey);
		} else if (ch[0].mode === 'tutorial' || !isAdaptive) {
			const det = await pickNpcDeterministic(db, {
				npcUserId: ch[0].opponentUserId,
				kind: 'attack',
				exclude: [],
				language: lang
			});
			attackText = det?.text ?? '';
		} else {
			const npc = await generateNpcLlm(db, llmEnv, {
				npcUserId: ch[0].opponentUserId,
				personaDescription: persona[0].description,
				personaDescriptionIt: persona[0].descriptionIt,
				role: 'attacker',
				lastUserText: '',
				mirrorLanguage: lang,
				difficulty: ch[0].difficulty as Difficulty
			});
			attackText = npc.text;
			opponentModel = npc.modelId;
		}
		defenseText = text;
	}

	const verdict = await judgeTurn(env as Parameters<typeof judgeTurn>[0], {
		attackText,
		defenseText,
		language: lang
	});

	const turnId = newUlid();
	const turnNumber = (lastTurn?.turnNumber ?? 0) + 1;
	const attackSource: AttackSource = attacker === 'user' ? body.source : 'opponent_npc';
	const defenseSource: DefenseSource =
		attacker === 'user' ? 'opponent_npc' : (body.source as DefenseSource);
	await db.insert(turns).values({
		id: turnId,
		matchId: curMatch.id,
		turnNumber,
		isSuddenDeath: turnNumber > 5,
		attacker,
		attackText,
		attackSource,
		defenseText,
		defenseSource,
		judgment: verdict.judgment,
		judgmentReasoning: verdict.reasoning ?? null,
		judgeModel: verdict.modelId,
		opponentModel,
		attackStartedAt: Date.now(),
		defenseSubmittedAt: Date.now(),
		judgedAt: Date.now()
	});

	const upd = {
		scoreUser: curMatch.scoreUser,
		scoreOpponent: curMatch.scoreOpponent,
		scoreTies: curMatch.scoreTies
	};
	if (verdict.judgment === 'tie') upd.scoreTies++;
	else if (
		(attacker === 'user' && verdict.judgment === 'attacker_wins') ||
		(attacker === 'opponent' && verdict.judgment === 'defender_wins')
	)
		upd.scoreUser++;
	else upd.scoreOpponent++;
	await db.update(matches).set(upd).where(eq(matches.id, curMatch.id));

	const finalScore = {
		user: upd.scoreUser,
		opponent: upd.scoreOpponent,
		ties: upd.scoreTies,
		turnsPlayed: turnNumber,
		suddenDeath: turnNumber > 5 ? turnNumber - 5 : 0
	};
	const matchIsOver = isMatchOver(finalScore);
	const mWinner = matchIsOver ? matchWinner(finalScore) : null;
	let challengeOver = false;
	if (matchIsOver) {
		await db
			.update(matches)
			.set({
				status: 'completed',
				winner: mWinner,
				endReason: turnNumber > 5 ? 'sudden_death_resolved' : 'turns_completed',
				endedAt: Date.now()
			})
			.where(eq(matches.id, curMatch.id));
		if (ch[0].format === 'bo1') {
			await db
				.update(challenges)
				.set({
					status: 'completed',
					winner: mWinner,
					endReason: 'matches_completed',
					endedAt: Date.now()
				})
				.where(eq(challenges.id, ch[0].id));
			challengeOver = true;
		}
	}

	await applyLearning({
		db,
		env: llmEnv,
		ctx: { waitUntil: (p) => platform.ctx.waitUntil(p) },
		saveFn: saveEntryWithBackfill,
		turn: {
			attacker,
			attackText,
			defenseText: defenseText || null,
			judgment: verdict.judgment
		},
		userId,
		npcUserId: ch[0].opponentUserId,
		npcPoolMode: persona[0].poolMode
	});

	const responseBody = JSON.stringify({
		turnId,
		turnNumber,
		attacker,
		attackText,
		defenseText,
		judgment: verdict.judgment,
		reasoning: verdict.reasoning ?? null,
		matchOver: matchIsOver,
		matchWinner: mWinner,
		challengeOver,
		score: { user: upd.scoreUser, opponent: upd.scoreOpponent, ties: upd.scoreTies }
	});
	await env.KV.put(`turn-idem:${params.id}:${idemKey}`, responseBody, { expirationTtl: 3600 });
	return new Response(responseBody, {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
