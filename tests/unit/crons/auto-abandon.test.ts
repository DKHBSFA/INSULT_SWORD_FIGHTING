import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { makeDb } from '../../../src/lib/server/db/client';
import { autoAbandonStaleChallenges } from '../../../src/lib/server/crons/auto-abandon';
import { user, opponentPersonas, scenes, challenges } from '../../../db/schema';
import { newUlid } from '../../../src/lib/server/db/ulid';

beforeEach(async () => {
	const db = makeDb(env.DB);
	await db.delete(challenges);
	await db.delete(opponentPersonas);
	await db.delete(scenes);
	await db.delete(user);

	await db.insert(user).values([
		{
			id: 'p1',
			email: 'p1@x',
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: 'brutus',
			email: 'b@x',
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date()
		}
	]);
	await db.insert(opponentPersonas).values({
		id: 'brutus',
		userId: 'brutus',
		name: 'Brutus',
		description: 'pirate',
		spriteSetUrl: '/x.svg',
		poolMode: 'adaptive',
		active: true
	});
	await db.insert(scenes).values({
		id: 's1',
		name: 'S',
		svgLayersJson: '{}',
		active: true,
		createdAt: Date.now()
	});
});

describe('autoAbandonStaleChallenges', () => {
	it('marks challenges older than 3 min as abandoned', async () => {
		const db = makeDb(env.DB);
		const old = Date.now() - 5 * 60 * 1000;
		await db.insert(challenges).values({
			id: newUlid(),
			userId: 'p1',
			opponentUserId: 'brutus',
			opponentType: 'ai',
			mode: 'match',
			format: 'bo1',
			sceneId: 's1',
			status: 'in_progress',
			startedAt: old
		});
		const n = await autoAbandonStaleChallenges(db);
		expect(n).toBe(1);
	});
	it('leaves fresh challenges untouched', async () => {
		const db = makeDb(env.DB);
		await db.insert(challenges).values({
			id: newUlid(),
			userId: 'p1',
			opponentUserId: 'brutus',
			opponentType: 'ai',
			mode: 'match',
			format: 'bo1',
			sceneId: 's1',
			status: 'in_progress',
			startedAt: Date.now()
		});
		const n = await autoAbandonStaleChallenges(db);
		expect(n).toBe(0);
	});
});
