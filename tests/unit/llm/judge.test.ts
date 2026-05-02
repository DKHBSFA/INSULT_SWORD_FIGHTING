import { describe, it, expect, vi } from 'vitest';
import { judgeTurn } from '../../../src/lib/server/llm/judge';
import type { GatewayEnv } from '../../../src/lib/server/llm/gateway';

describe('judgeTurn', () => {
	it('returns parsed verdict', async () => {
		const env = {
			AI: {
				run: vi.fn().mockResolvedValue({
					response: '{"judgment":"defender_wins","reasoning":"clever rebuttal"}'
				})
			},
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv;
		const r = await judgeTurn(env, { attackText: 'a', defenseText: 'b' });
		expect(r.judgment).toBe('defender_wins');
		expect(r.reasoning).toBe('clever rebuttal');
	});
	it('throws on invalid JSON', { timeout: 15000 }, async () => {
		const env = {
			AI: { run: vi.fn().mockResolvedValue({ response: 'not json' }) },
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv;
		await expect(judgeTurn(env, { attackText: 'a', defenseText: 'b' })).rejects.toThrow();
	});
});
