import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makeDb } from '$lib/server/db/client';
import { userProfile } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { validateDisplayName } from '$lib/shared/validation';
import { readDevUserId } from '$lib/server/auth/dev-user';

export const PATCH: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });
	const body = (await request.json()) as {
		displayName?: string;
		anonymous?: boolean;
		language?: 'en' | 'it';
	};
	const upd: Record<string, unknown> = { updatedAt: Date.now() };
	if (body.displayName !== undefined) upd.displayName = validateDisplayName(body.displayName);
	if (body.language) upd.language = body.language;
	if (body.anonymous !== undefined)
		upd.settingsJson = JSON.stringify({ leaderboard_anonymous: body.anonymous });
	await db.update(userProfile).set(upd).where(eq(userProfile.userId, userId));
	return json({ ok: true });
};
