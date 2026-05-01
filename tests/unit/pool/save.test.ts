import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { makeDb } from '../../../src/lib/server/db/client';
import { saveEntry } from '../../../src/lib/server/pool/save';
import { user, attackPool } from '../../../db/schema';

beforeEach(async () => {
	const db = makeDb(env.DB);
	await db
		.insert(user)
		.values({
			id: 'u1',
			email: 'u1@x',
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.onConflictDoNothing();
});

describe('saveEntry', () => {
	it('inserts a row with normalized', async () => {
		const db = makeDb(env.DB);
		const id = await saveEntry(db, {
			userId: 'u1',
			kind: 'attack',
			text: '  HELLO ',
			source: 'manual'
		});
		const rows = await db.select().from(attackPool);
		expect(rows.find((r) => r.id === id)?.normalized).toBe('hello');
	});
	it('returns existing id on duplicate', async () => {
		const db = makeDb(env.DB);
		const id1 = await saveEntry(db, {
			userId: 'u1',
			kind: 'attack',
			text: 'duplicate',
			source: 'manual'
		});
		const id2 = await saveEntry(db, {
			userId: 'u1',
			kind: 'attack',
			text: 'DUPLICATE  ',
			source: 'manual'
		});
		expect(id2).toBe(id1);
	});
});
