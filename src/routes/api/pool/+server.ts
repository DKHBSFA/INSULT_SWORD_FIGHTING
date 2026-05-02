import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makeDb } from '$lib/server/db/client';
import { attackPool, defensePool } from '../../../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { saveEntryWithBackfill } from '$lib/server/pool/save';
import { getVectorizeBinding } from '$lib/server/pool/vectorize-mock';
import { validateInsultText } from '$lib/shared/validation';
import { readDevUserId } from '$lib/server/auth/dev-user';

export const GET: RequestHandler = async ({ url, request, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });
	const kind = url.searchParams.get('kind');
	const table = kind === 'attack' ? attackPool : kind === 'defense' ? defensePool : null;
	if (!table) return new Response('kind must be attack|defense', { status: 400 });
	const rows = await db
		.select()
		.from(table)
		.where(and(eq(table.userId, userId), isNull(table.deletedAt)));
	return json({ entries: rows });
};

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });
	const body = (await request.json()) as { kind: 'attack' | 'defense'; text: string };
	const text = validateInsultText(body.text);
	const llmEnv = {
		...env,
		POOL_VECTORS: getVectorizeBinding(env)
	} as Parameters<typeof saveEntryWithBackfill>[1];
	const id = await saveEntryWithBackfill(
		db,
		llmEnv,
		{ waitUntil: (p) => platform.ctx.waitUntil(p) },
		{ userId, kind: body.kind, text, source: 'manual' }
	);
	return json({ id }, { status: 201 });
};
