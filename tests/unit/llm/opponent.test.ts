import { describe, it, expect, vi } from 'vitest';
import { generateOpponent } from '../../../src/lib/server/llm/opponent';
import type { GatewayEnv } from '../../../src/lib/server/llm/gateway';

describe('generateOpponent', () => {
	it('returns generated text', async () => {
		const env = {
			AI: { run: vi.fn().mockResolvedValue({ response: 'Aye, scurvy dog!' }) },
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv;
		const r = await generateOpponent(env, {
			role: 'attacker',
			personaDescription: 'old British pirate',
			fewShot: [{ kind: 'attack', text: 'Yer barnacle-faced!' }],
			lastUserText: '',
			mirrorLanguage: 'en'
		});
		expect(r.text).toContain('scurvy');
		expect(r.modelId).toBeDefined();
	});
});
