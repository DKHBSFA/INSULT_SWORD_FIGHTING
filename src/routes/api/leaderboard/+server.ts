import type { RequestHandler } from './$types';
import { makeDb } from '$lib/server/db/client';
import { topChallengesWon } from '$lib/server/game/leaderboard';

export const GET: RequestHandler = async ({ url, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const type = url.searchParams.get('type') ?? 'challenges_won';
	const cacheKey = `lb:${type}`;
	const cached = await env.KV.get(cacheKey);
	if (cached)
		return new Response(cached, {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});

	const db = makeDb(env.DB);
	let data: unknown = [];
	if (type === 'challenges_won') data = await topChallengesWon(db);

	const body = JSON.stringify({ type, data });
	await env.KV.put(cacheKey, body, { expirationTtl: 300 });
	return new Response(body, {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
