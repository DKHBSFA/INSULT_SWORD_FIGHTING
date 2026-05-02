import { runWorkersAI, type GatewayEnv } from './gateway';
import { withRetry, withTimeout } from './retry';

export async function embedText(env: GatewayEnv, text: string): Promise<number[]> {
	const result = await withRetry(
		() =>
			withTimeout(
				runWorkersAI<{ data: number[][] }>(env, '@cf/baai/bge-m3', { text: [text] }),
				15_000
			),
		{ maxAttempts: 3, baseDelayMs: 250 }
	);
	if (!result.data?.[0]) throw new Error('embedding response missing data');
	return result.data[0];
}
