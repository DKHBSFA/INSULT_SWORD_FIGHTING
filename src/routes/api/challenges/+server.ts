import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makeDb } from '$lib/server/db/client';
import { challenges, opponentPersonas, scenes } from '../../../../db/schema';
import { newUlid } from '$lib/server/db/ulid';
import { isUniqueError } from '$lib/server/db/errors';
import { readDevUserId } from '$lib/server/auth/dev-user';
import { DIFFICULTIES, type Difficulty, modelForDifficulty } from '$lib/shared/difficulty';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });

	const body = (await request.json()) as {
		mode: 'tutorial' | 'match';
		opponentUserId: string;
		format: 'bo1' | 'bo2';
		difficulty?: Difficulty;
	};
	const difficulty: Difficulty =
		body.difficulty && DIFFICULTIES.includes(body.difficulty) ? body.difficulty : 'medium';
	const modelId = modelForDifficulty(difficulty).opponent;

	const persona = await db
		.select()
		.from(opponentPersonas)
		.where(eq(opponentPersonas.userId, body.opponentUserId))
		.limit(1);
	if (persona.length === 0) return new Response('opponent not found', { status: 400 });
	if (body.mode === 'tutorial' && persona[0]!.poolMode !== 'fixed')
		return new Response('tutorial requires Trainer', { status: 400 });
	if (body.mode === 'match' && persona[0]!.poolMode !== 'adaptive')
		return new Response('match requires non-Trainer NPC', { status: 400 });

	const scene = await db.select().from(scenes).where(eq(scenes.active, true)).limit(1);
	if (scene.length === 0) return new Response('no active scene', { status: 500 });

	const id = newUlid();
	const now = Date.now();
	try {
		await db.insert(challenges).values({
			id,
			userId,
			opponentUserId: body.opponentUserId,
			opponentType: 'ai',
			mode: body.mode,
			format: body.format,
			difficulty,
			modelId,
			sceneId: scene[0]!.id,
			status: 'in_progress',
			startedAt: now
		});
		return json({ id, difficulty, modelId }, { status: 201 });
	} catch (e: unknown) {
		if (isUniqueError(e)) {
			const active = await db
				.select({ id: challenges.id })
				.from(challenges)
				.where(and(eq(challenges.userId, userId), eq(challenges.status, 'in_progress')))
				.limit(1);
			return json({ activeChallengeId: active[0]?.id }, { status: 409 });
		}
		throw e;
	}
};
