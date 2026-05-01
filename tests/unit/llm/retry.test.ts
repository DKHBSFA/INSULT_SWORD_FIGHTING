import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../../src/lib/server/llm/retry';

describe('withRetry', () => {
	it('returns on first success', async () => {
		const fn = vi.fn(async () => 'ok');
		const r = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 });
		expect(r).toBe('ok');
		expect(fn).toHaveBeenCalledTimes(1);
	});
	it('retries on failure and succeeds', async () => {
		let n = 0;
		const fn = async () => {
			n++;
			if (n < 3) throw new Error('fail');
			return 'ok';
		};
		const r = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 });
		expect(r).toBe('ok');
		expect(n).toBe(3);
	});
	it('throws after max attempts', async () => {
		const fn = vi.fn(async () => {
			throw new Error('fail');
		});
		await expect(withRetry(fn, { maxAttempts: 2, baseDelayMs: 1 })).rejects.toThrow('fail');
		expect(fn).toHaveBeenCalledTimes(2);
	});
});
