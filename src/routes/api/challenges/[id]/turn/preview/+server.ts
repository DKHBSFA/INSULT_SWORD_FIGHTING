import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makeDb } from '$lib/server/db/client';
import {
	challenges,
	matches,
	turns,
	opponentPersonas,
	userProfile
} from '../../../../../../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateNpcLlm, pickNpcDeterministic } from '$lib/server/game/npc';
import { getVectorizeBinding } from '$lib/server/pool/vectorize-mock';
import { nextAttacker } from '$lib/server/game/state';
import { readDevUserId } from '$lib/server/auth/dev-user';
import type { Judgment, Side } from '$lib/shared/types';

export const POST: RequestHandler = async ({ request, params, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });

	const ch = (await db.select().from(challenges).where(eq(challenges.id, params.id)).limit(1))[0];
	if (!ch || ch.userId !== userId) return new Response('not found', { status: 404 });
	if (ch.status !== 'in_progress') return new Response('challenge not active', { status: 409 });

	const persona = (
		await db
			.select()
			.from(opponentPersonas)
			.where(eq(opponentPersonas.userId, ch.opponentUserId))
			.limit(1)
	)[0];
	if (!persona) return new Response('persona not found', { status: 500 });

	const profile = (
		await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1)
	)[0];
	const lang: 'en' | 'it' = profile?.language ?? 'en';

	const curMatch = (
		await db
			.select()
			.from(matches)
			.where(and(eq(matches.challengeId, ch.id), eq(matches.status, 'in_progress')))
			.orderBy(desc(matches.matchIndex))
			.limit(1)
	)[0];
	if (!curMatch) {
		return json({ attacker: 'user' as Side, attackText: null });
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

	if (attacker === 'user') {
		return json({ attacker, attackText: null });
	}

	const turnNumber = (lastTurn?.turnNumber ?? 0) + 1;
	const cacheKey = `turn-attack-pending:${ch.id}:${turnNumber}`;
	const cached = await env.KV.get(cacheKey);
	if (cached) {
		return json({ attacker, attackText: cached, turnNumber });
	}

	let attackText: string;
	const isAdaptive = persona.poolMode === 'adaptive';
	if (ch.mode === 'tutorial' || !isAdaptive) {
		const det = await pickNpcDeterministic(db, {
			npcUserId: ch.opponentUserId,
			kind: 'attack',
			exclude: [],
			language: lang
		});
		attackText = det?.text ?? '';
	} else {
		const llmEnv = {
			...env,
			POOL_VECTORS: getVectorizeBinding(env)
		} as Parameters<typeof generateNpcLlm>[1];
		const npc = await generateNpcLlm(db, llmEnv, {
			npcUserId: ch.opponentUserId,
			personaDescription: persona.description,
			personaDescriptionIt: persona.descriptionIt,
			role: 'attacker',
			lastUserText: '',
			mirrorLanguage: lang
		});
		attackText = npc.text;
	}

	await env.KV.put(cacheKey, attackText, { expirationTtl: 600 });
	return json({ attacker, attackText, turnNumber });
};
