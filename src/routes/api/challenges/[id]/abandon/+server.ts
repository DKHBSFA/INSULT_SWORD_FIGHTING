import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makeDb } from '$lib/server/db/client';
import { challenges, matches } from '../../../../../../db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, platform, request }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = env.ENVIRONMENT !== 'production' ? request.headers.get('X-Test-User') : null;
	if (!userId) return new Response('unauthorized', { status: 401 });

	await db
		.update(challenges)
		.set({
			status: 'abandoned',
			endReason: 'abandoned',
			winner: 'opponent',
			endedAt: Date.now()
		})
		.where(and(eq(challenges.id, params.id), eq(challenges.userId, userId)));
	await db
		.update(matches)
		.set({ status: 'abandoned', endReason: 'abandoned', endedAt: Date.now() })
		.where(eq(matches.challengeId, params.id));
	return json({ ok: true });
};
