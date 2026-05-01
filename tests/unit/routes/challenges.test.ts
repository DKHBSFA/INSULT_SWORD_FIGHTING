import { describe, it, expect, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';
import { makeDb } from '../../../src/lib/server/db/client';
import {
	user,
	userProfile,
	opponentPersonas,
	scenes,
	challenges,
	matches,
	turns,
	attackPool,
	defensePool
} from '../../../db/schema';

beforeEach(async () => {
	const db = makeDb(env.DB);
	await db.delete(turns);
	await db.delete(matches);
	await db.delete(challenges);
	await db.delete(attackPool);
	await db.delete(defensePool);
	await db.delete(userProfile);
	await db.delete(opponentPersonas);
	await db.delete(scenes);
	await db.delete(user);

	await db.insert(user).values({
		id: 'p1',
		email: 'p1@x',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	await db.insert(userProfile).values({
		userId: 'p1',
		language: 'en',
		isNpc: false,
		createdAt: Date.now(),
		updatedAt: Date.now()
	});
	await db.insert(user).values({
		id: 'brutus',
		email: 'npc-brutus@isf.local',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	await db.insert(opponentPersonas).values({
		id: 'brutus',
		userId: 'brutus',
		name: 'Brutus',
		description: 'old british pirate',
		spriteSetUrl: '/personas/brutus.svg',
		poolMode: 'adaptive',
		active: true
	});
	await db.insert(scenes).values({
		id: 'ship_deck_night',
		name: 'Ship Deck Night',
		svgLayersJson: '{}',
		active: true,
		createdAt: Date.now()
	});
});

describe('POST /api/challenges', () => {
	it('creates a challenge with valid input', async () => {
		const res = await SELF.fetch('https://example.com/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Test-User': 'p1' },
			body: JSON.stringify({ mode: 'match', opponentUserId: 'brutus', format: 'bo1' })
		});
		expect(res.status).toBe(201);
	});
	it('returns 409 when in_progress already exists', async () => {
		await SELF.fetch('https://example.com/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Test-User': 'p1' },
			body: JSON.stringify({ mode: 'match', opponentUserId: 'brutus', format: 'bo1' })
		});
		const res2 = await SELF.fetch('https://example.com/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Test-User': 'p1' },
			body: JSON.stringify({ mode: 'match', opponentUserId: 'brutus', format: 'bo1' })
		});
		expect(res2.status).toBe(409);
	});
});

describe('GET /api/challenges/:id', () => {
	it('returns challenge state', async () => {
		const create = await SELF.fetch('https://example.com/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Test-User': 'p1' },
			body: JSON.stringify({ mode: 'match', opponentUserId: 'brutus', format: 'bo1' })
		});
		const { id } = (await create.json()) as { id: string };
		const res = await SELF.fetch(`https://example.com/api/challenges/${id}`, {
			headers: { 'X-Test-User': 'p1' }
		});
		expect(res.status).toBe(200);
		const body = (await res.json()) as { status: string };
		expect(body.status).toBe('in_progress');
	});
});

describe('POST /api/challenges/:id/turn', () => {
	it('requires Idempotency-Key header', async () => {
		const create = await SELF.fetch('https://example.com/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Test-User': 'p1' },
			body: JSON.stringify({ mode: 'match', opponentUserId: 'brutus', format: 'bo1' })
		});
		const { id } = (await create.json()) as { id: string };
		const res = await SELF.fetch(`https://example.com/api/challenges/${id}/turn`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Test-User': 'p1' },
			body: JSON.stringify({ text: 'hello', source: 'free_text' })
		});
		expect(res.status).toBe(400);
	});
});

describe('POST /api/challenges/:id/abandon', () => {
	it('marks abandoned', async () => {
		const create = await SELF.fetch('https://example.com/api/challenges', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Test-User': 'p1' },
			body: JSON.stringify({ mode: 'match', opponentUserId: 'brutus', format: 'bo1' })
		});
		const { id } = (await create.json()) as { id: string };
		const res = await SELF.fetch(`https://example.com/api/challenges/${id}/abandon`, {
			method: 'POST',
			headers: { 'X-Test-User': 'p1' }
		});
		expect(res.status).toBe(200);
	});
});
