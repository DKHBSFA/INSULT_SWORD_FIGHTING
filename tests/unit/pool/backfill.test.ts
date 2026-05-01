import { describe, it, expect, vi, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { makeDb } from '../../../src/lib/server/db/client';
import { backfillEntries } from '../../../src/lib/server/pool/backfill';
import { user, attackPool } from '../../../db/schema';
import { newUlid } from '../../../src/lib/server/db/ulid';
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
	await db.insert(attackPool).values({
		id: newUlid(),
		userId: 'u1',
		text: 'pending',
		normalized: 'pending',
		source: 'manual',
		createdAt: Date.now()
	});
});

describe('backfillEntries', () => {
	it('processes rows with NULL embedding_id', async () => {
		const db = makeDb(env.DB);
		const llmEnv = {
			AI: {
				run: vi
					.fn()
					.mockResolvedValueOnce({ response: '{"tropes":[],"retorica":[],"sagacity":5}' })
					.mockResolvedValueOnce({ data: [new Array(1024).fill(0.1)] })
			},
			POOL_VECTORS: { insert: vi.fn().mockResolvedValue({ ids: [], count: 0 }) },
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv & PoolEnv;
		const n = await backfillEntries(db, llmEnv, 10);
		expect(n).toBeGreaterThan(0);
	});
});
