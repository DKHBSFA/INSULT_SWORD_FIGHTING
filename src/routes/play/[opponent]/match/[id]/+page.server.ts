import type { PageServerLoad } from './$types';
import { makeDb } from '$lib/server/db/client';
import {
	challenges,
	attackPool,
	defensePool,
	matches,
	turns,
	opponentPersonas,
	userProfile
} from '../../../../../../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { nextAttacker } from '$lib/server/game/state';
import type { Judgment, Side } from '$lib/shared/types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env)
		return {
			challenge: null,
			attackPool: [],
			defensePool: [],
			persona: null,
			match: null,
			recentTurns: [],
			currentAttacker: 'user' as Side,
			userLang: 'en' as 'en' | 'it'
		};
	const env = platform.env;
	const db = makeDb(env.DB);

	const ch = (await db.select().from(challenges).where(eq(challenges.id, params.id)).limit(1))[0];
	const userId = ch?.userId;
	const profile = userId
		? (await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1))[0]
		: null;
	const userLang: 'en' | 'it' = profile?.language ?? 'en';

	const [aPool, dPool, persona, curMatch] = await Promise.all([
		userId
			? db
					.select()
					.from(attackPool)
					.where(
						and(
							eq(attackPool.userId, userId),
							eq(attackPool.language, userLang),
							isNull(attackPool.deletedAt)
						)
					)
			: Promise.resolve([]),
		userId
			? db
					.select()
					.from(defensePool)
					.where(
						and(
							eq(defensePool.userId, userId),
							eq(defensePool.language, userLang),
							isNull(defensePool.deletedAt)
						)
					)
			: Promise.resolve([]),
		ch
			? db
					.select()
					.from(opponentPersonas)
					.where(eq(opponentPersonas.userId, ch.opponentUserId))
					.limit(1)
					.then((r) => r[0] ?? null)
			: Promise.resolve(null),
		ch
			? db
					.select()
					.from(matches)
					.where(and(eq(matches.challengeId, ch.id), eq(matches.status, 'in_progress')))
					.orderBy(desc(matches.matchIndex))
					.limit(1)
					.then((r) => r[0] ?? null)
			: Promise.resolve(null)
	]);

	const recentTurns = curMatch
		? await db
				.select()
				.from(turns)
				.where(eq(turns.matchId, curMatch.id))
				.orderBy(desc(turns.turnNumber))
				.limit(3)
		: [];

	const lastTurn = recentTurns[0];
	const currentAttacker: Side = curMatch
		? lastTurn
			? nextAttacker(lastTurn.attacker as Side, lastTurn.judgment as Exclude<Judgment, 'timeout'>)
			: (curMatch.firstAttacker as Side)
		: 'user';

	return {
		challenge: ch ?? null,
		attackPool: aPool,
		defensePool: dPool,
		persona,
		match: curMatch,
		recentTurns,
		currentAttacker,
		userLang
	};
};
