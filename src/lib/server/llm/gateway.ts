import type { Ai } from '@cloudflare/workers-types';
import { makeAnthropicAi } from './anthropic-adapter';

export type GatewayEnv = {
	AI?: Ai;
	AI_GATEWAY_ID?: string;
	ANTHROPIC_API_KEY?: string;
	ENVIRONMENT: string;
};

type GatewayOpts = { gateway?: { id: string; skipCache: boolean } };

function resolveAi(env: GatewayEnv): Ai {
	if (env.ENVIRONMENT === 'production' || env.ENVIRONMENT === 'staging') {
		if (!env.AI) throw new Error('AI binding required in non-dev env');
		return env.AI;
	}
	if (env.ANTHROPIC_API_KEY) return makeAnthropicAi(env.ANTHROPIC_API_KEY);
	if (env.AI) return env.AI;
	throw new Error('No AI provider available — set ANTHROPIC_API_KEY in .dev.vars');
}

export async function runWorkersAI<T>(env: GatewayEnv, model: string, input: unknown): Promise<T> {
	const ai = resolveAi(env);
	const opts: GatewayOpts = {};
	if (env.AI_GATEWAY_ID) {
		opts.gateway = { id: env.AI_GATEWAY_ID, skipCache: false };
	}
	return (await ai.run(
		model as Parameters<Ai['run']>[0],
		input as Parameters<Ai['run']>[1],
		opts as Parameters<Ai['run']>[2]
	)) as T;
}
