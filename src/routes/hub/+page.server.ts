import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { makeDb } from '$lib/server/db/client';
import { user, challenges } from '../../../db/schema';
import { DEV_USER_COOKIE } from '$lib/server/auth/dev-user';
import { sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const userId = cookies.get(DEV_USER_COOKIE);
	if (!userId) throw redirect(302, '/login');
	if (!platform?.env) {
		return { userId, displayName: userId, wins: 0, totalChallenges: 0 };
	}

	const db = makeDb(platform.env.DB);

	const [u] = await db
		.select({ id: user.id, name: user.name })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	const [stats] = await db
		.select({
			total: sql<number>`COUNT(*)`,
			wins: sql<number>`SUM(CASE WHEN ${challenges.winner} = 'user' AND ${challenges.status} = 'completed' THEN 1 ELSE 0 END)`
		})
		.from(challenges)
		.where(eq(challenges.userId, userId));

	return {
		userId,
		displayName: u?.name ?? userId,
		wins: Number(stats?.wins ?? 0),
		totalChallenges: Number(stats?.total ?? 0)
	};
};
