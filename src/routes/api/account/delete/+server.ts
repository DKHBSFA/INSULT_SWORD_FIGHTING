import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makeDb } from '$lib/server/db/client';
import {
	user,
	account,
	verification,
	userProfile,
	attackPool,
	defensePool,
	challenges
} from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { readDevUserId } from '$lib/server/auth/dev-user';
import { deletePoolVectors, type PoolEnv } from '$lib/server/pool/search';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });

	const aIds = (
		await db.select({ id: attackPool.id }).from(attackPool).where(eq(attackPool.userId, userId))
	).map((r) => r.id);
	const dIds = (
		await db.select({ id: defensePool.id }).from(defensePool).where(eq(defensePool.userId, userId))
	).map((r) => r.id);

	await db.delete(attackPool).where(eq(attackPool.userId, userId));
	await db.delete(defensePool).where(eq(defensePool.userId, userId));
	await db.delete(userProfile).where(eq(userProfile.userId, userId));
	await db.update(challenges).set({ userId: null }).where(eq(challenges.userId, userId));
	await db
		.update(attackPool)
		.set({ learnedFromUserId: null })
		.where(eq(attackPool.learnedFromUserId, userId));
	await db
		.update(defensePool)
		.set({ learnedFromUserId: null })
		.where(eq(defensePool.learnedFromUserId, userId));
	await db.delete(verification).where(eq(verification.identifier, userId));
	await db.delete(account).where(eq(account.userId, userId));
	await db.delete(user).where(eq(user.id, userId));

	if (env.POOL_VECTORS) {
		try {
			await deletePoolVectors({ POOL_VECTORS: env.POOL_VECTORS } as PoolEnv, [...aIds, ...dIds]);
		} catch (e) {
			console.error('Vectorize cleanup failed:', e);
		}
	}
	return json({ ok: true });
};
