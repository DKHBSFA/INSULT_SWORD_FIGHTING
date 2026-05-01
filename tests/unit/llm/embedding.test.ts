import { describe, it, expect, vi } from 'vitest';
import { embedText } from '../../../src/lib/server/llm/embedding';
import type { GatewayEnv } from '../../../src/lib/server/llm/gateway';

describe('embedText', () => {
	it('calls AI.run with bge-m3 and returns vector', async () => {
		const env = {
			AI: { run: vi.fn().mockResolvedValue({ data: [[0.1, 0.2, 0.3]] }) },
			ENVIRONMENT: 'test'
		} as unknown as GatewayEnv;
		const v = await embedText(env, 'hello');
		expect(v).toEqual([0.1, 0.2, 0.3]);
		expect(env.AI!.run).toHaveBeenCalledWith(
			'@cf/baai/bge-m3',
			expect.objectContaining({ text: ['hello'] }),
			expect.any(Object)
		);
	});
});
