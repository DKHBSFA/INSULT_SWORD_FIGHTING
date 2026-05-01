import { sql, eq, and } from 'drizzle-orm';
import { challenges, userProfile } from '../../../../db/schema';
import type { AppDb } from '../db/client';

export async function topChallengesWon(db: AppDb, limit = 50) {
	const rows = await db
		.select({
			userId: challenges.userId,
			wins: sql<number>`count(*)`,
			displayName: userProfile.displayName,
			anonymous: sql<number>`json_extract(${userProfile.settingsJson}, '$.leaderboard_anonymous')`
		})
		.from(challenges)
		.leftJoin(userProfile, eq(userProfile.userId, challenges.userId))
		.where(and(eq(challenges.winner, 'user'), eq(challenges.status, 'completed')))
		.groupBy(challenges.userId)
		.orderBy(sql`count(*) desc`)
		.limit(limit);
	return rows.map((r) => ({
		userId: r.userId,
		name: r.anonymous === 1 ? `Player_${(r.userId ?? '').slice(-6)}` : r.displayName,
		wins: r.wins
	}));
}
