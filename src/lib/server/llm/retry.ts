export type RetryOpts = { maxAttempts: number; baseDelayMs: number };

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOpts): Promise<T> {
	let lastErr: unknown;
	for (let i = 0; i < opts.maxAttempts; i++) {
		try {
			return await fn();
		} catch (e) {
			lastErr = e;
			if (i < opts.maxAttempts - 1) {
				const delay = opts.baseDelayMs * Math.pow(4, i);
				await new Promise((r) => setTimeout(r, delay));
			}
		}
	}
	throw lastErr;
}

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		p,
		new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
	]);
}
