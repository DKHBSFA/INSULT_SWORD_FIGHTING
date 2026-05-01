import { describe, it, expect } from 'vitest';
import { queryPoolVectors } from '../../../src/lib/server/pool/search';
import type { VectorizeIndex } from '@cloudflare/workers-types';

describe('queryPoolVectors', () => {
	it('refuses to query without userId', async () => {
		const env = {
			POOL_VECTORS: {
				query: () => Promise.resolve({ matches: [], count: 0 })
			} as unknown as VectorizeIndex
		};
		await expect(
			queryPoolVectors(env, {
				vector: new Array(1024).fill(0),
				userId: '',
				kind: 'attack',
				topK: 5
			})
		).rejects.toThrow(/userId required/);
	});
});
