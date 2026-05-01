import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env } from 'cloudflare:test';
import { makeDb } from '../../../src/lib/server/db/client';
import { pickNpcDeterministic, generateNpcLlm } from '../../../src/lib/server/game/npc';
import { user, attackPool } from '../../../db/schema';
import { newUlid } from '../../../src/lib/server/db/ulid';
import type { GatewayEnv } from '../../../src/lib/server/llm/gateway';
import type { PoolEnv } from '../../../src/lib/server/pool/search';

beforeEach(async () => {
	const db = makeDb(env.DB);
	await db
		.insert(user)
		.values({
			id: 'trainer',
			email: 'npc-trainer@isf.local',
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.onConflictDoNothing();
	for (let i = 0; i < 3; i++) {
		await db.insert(attackPool).values({
			id: newUlid(),
			userId: 'trainer',
			text: `seed ${i}`,
			normalized: `seed ${i}`,
			source: 'seed',
			createdAt: Date.now()
		});
	}
});

describe('pickNpcDeterministic', () => {
	it('picks an entry from npc pool', async () => {
		const db = makeDb(env.DB);
		const r = await pickNpcDeterministic(db, {
			npcUserId: 'trainer',
			kind: 'attack',
			exclude: []
		});
		expect(r?.text.startsWith('seed ')).toBe(true);
	});
});

describe('generateNpcLlm', () => {
	it('retrieves few-shot and calls opponent LLM', async () => {
		const db = makeDb(env.DB);
		const llmEnv = {
			AI: {
				run: vi
					.fn()
					.mockResolvedValueOnce({ data: [new Array(1024).fill(0.1)] })
					.mockResolvedValueOnce({ response: 'Aye, beast!' })
			},
			POOL_VECTORS: { query: vi.fn().mockResolvedValue({ matches: [], count: 0 }) },
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv & PoolEnv;
		const r = await generateNpcLlm(db, llmEnv, {
			npcUserId: 'trainer',
			personaDescription: 'pirate',
			role: 'attacker',
			lastUserText: '',
			mirrorLanguage: 'en'
		});
		expect(r.text).toBe('Aye, beast!');
		expect(r.modelId).toBeDefined();
	});
});
