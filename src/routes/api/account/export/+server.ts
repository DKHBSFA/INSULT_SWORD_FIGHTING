import type { RequestHandler } from './$types';
import { makeDb } from '$lib/server/db/client';
import { user, userProfile, attackPool, defensePool, challenges } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = env.ENVIRONMENT !== 'production' ? request.headers.get('X-Test-User') : null;
	if (!userId) return new Response('unauthorized', { status: 401 });

	const data = {
		user: await db.select().from(user).where(eq(user.id, userId)),
		userProfile: await db.select().from(userProfile).where(eq(userProfile.userId, userId)),
		attackPool: await db.select().from(attackPool).where(eq(attackPool.userId, userId)),
		defensePool: await db.select().from(defensePool).where(eq(defensePool.userId, userId)),
		challenges: await db.select().from(challenges).where(eq(challenges.userId, userId))
	};
	return new Response(JSON.stringify(data, null, 2), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': 'attachment; filename="isf-export.json"'
		}
	});
};
