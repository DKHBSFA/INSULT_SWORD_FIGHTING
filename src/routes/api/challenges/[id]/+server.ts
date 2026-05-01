import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makeDb } from '$lib/server/db/client';
import { challenges, matches, turns } from '../../../../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, platform, request }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = env.ENVIRONMENT !== 'production' ? request.headers.get('X-Test-User') : null;
	if (!userId) return new Response('unauthorized', { status: 401 });

	const ch = await db.select().from(challenges).where(eq(challenges.id, params.id)).limit(1);
	if (ch.length === 0) return new Response('not found', { status: 404 });
	if (ch[0]!.userId !== userId) return new Response('forbidden', { status: 403 });

	const ms = await db.select().from(matches).where(eq(matches.challengeId, params.id));
	const lastMatch = ms[ms.length - 1];
	const ts = lastMatch
		? await db
				.select()
				.from(turns)
				.where(eq(turns.matchId, lastMatch.id))
				.orderBy(asc(turns.turnNumber))
		: [];

	return json({ ...ch[0], matches: ms, currentMatchTurns: ts });
};
