import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env } from 'cloudflare:test';
import { makeDb } from '../../../src/lib/server/db/client';
import { saveEntry, saveEntryWithBackfill } from '../../../src/lib/server/pool/save';
import { user, attackPool } from '../../../db/schema';
import type { GatewayEnv } from '../../../src/lib/server/llm/gateway';
import type { PoolEnv } from '../../../src/lib/server/pool/search';

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

describe('saveEntryWithBackfill', () => {
	it('schedules backfill via ctx.waitUntil', async () => {
		const db = makeDb(env.DB);
		const waitUntil = vi.fn();
		const ctx = { waitUntil };
		const llmEnv = {
			AI: { run: vi.fn().mockResolvedValue({ data: [new Array(1024).fill(0.1)] }) },
			POOL_VECTORS: { insert: vi.fn().mockResolvedValue({ ids: [], count: 0 }) },
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv & PoolEnv;
		const id = await saveEntryWithBackfill(db, llmEnv, ctx, {
			userId: 'u1',
			kind: 'attack',
			text: 'fresh insult',
			source: 'manual'
		});
		expect(id).toBeTruthy();
		expect(waitUntil).toHaveBeenCalledTimes(1);
	});
});
