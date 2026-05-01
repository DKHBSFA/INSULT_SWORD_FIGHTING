import { describe, it, expect, vi } from 'vitest';
import { extractFeatures } from '../../../src/lib/server/llm/features';
import type { GatewayEnv } from '../../../src/lib/server/llm/gateway';

describe('extractFeatures', () => {
	it('parses JSON features', async () => {
		const env = {
			AI: {
				run: vi.fn().mockResolvedValue({
					response: '{"tropes":["physical_mockery"],"sagacity":7,"uses_metaphor":true}'
				})
			},
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv;
		const r = await extractFeatures(env, 'You move like a wounded hippo');
		expect(r.tropes).toContain('physical_mockery');
		expect(r.sagacity).toBe(7);
	});
});
