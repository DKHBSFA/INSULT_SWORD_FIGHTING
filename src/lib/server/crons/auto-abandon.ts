import { eq, and, lt } from 'drizzle-orm';
import { challenges, matches } from '../../../../db/schema';
import type { AppDb } from '../db/client';

const STALE_AFTER_MS = 3 * 60 * 1000;

export async function autoAbandonStaleChallenges(db: AppDb): Promise<number> {
	const cutoff = Date.now() - STALE_AFTER_MS;
	const stale = await db
		.select({ id: challenges.id })
		.from(challenges)
		.where(and(eq(challenges.status, 'in_progress'), lt(challenges.startedAt, cutoff)));
	for (const ch of stale) {
		await db
			.update(challenges)
			.set({
				status: 'abandoned',
				endReason: 'timeout_server',
				winner: 'opponent',
				endedAt: Date.now()
			})
			.where(eq(challenges.id, ch.id));
		await db
			.update(matches)
			.set({ status: 'abandoned', endReason: 'abandoned', endedAt: Date.now() })
			.where(eq(matches.challengeId, ch.id));
	}
	return stale.length;
}
