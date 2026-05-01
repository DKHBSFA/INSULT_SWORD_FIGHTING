import type { PageServerLoad } from './$types';
import { makeDb } from '$lib/server/db/client';
import { challenges, attackPool, defensePool } from '../../../../../../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env) return { challenge: null, attackPool: [], defensePool: [] };
	const env = platform.env;
	const db = makeDb(env.DB);
	const ch = (await db.select().from(challenges).where(eq(challenges.id, params.id)).limit(1))[0];
	const userId = ch?.userId;
	const aPool = userId
		? await db
				.select()
				.from(attackPool)
				.where(and(eq(attackPool.userId, userId), isNull(attackPool.deletedAt)))
		: [];
	const dPool = userId
		? await db
				.select()
				.from(defensePool)
				.where(and(eq(defensePool.userId, userId), isNull(defensePool.deletedAt)))
		: [];
	return { challenge: ch ?? null, attackPool: aPool, defensePool: dPool };
};
