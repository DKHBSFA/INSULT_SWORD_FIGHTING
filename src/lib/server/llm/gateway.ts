import type { Ai } from '@cloudflare/workers-types';

export type GatewayEnv = {
	AI: Ai;
	AI_GATEWAY_ID?: string;
	ENVIRONMENT: string;
};

type GatewayOpts = { gateway?: { id: string; skipCache: boolean } };

export async function runWorkersAI<T>(env: GatewayEnv, model: string, input: unknown): Promise<T> {
	const opts: GatewayOpts = {};
	if (env.AI_GATEWAY_ID) {
		opts.gateway = { id: env.AI_GATEWAY_ID, skipCache: false };
	}
	return (await env.AI.run(
		model as Parameters<Ai['run']>[0],
		input as Parameters<Ai['run']>[1],
		opts as Parameters<Ai['run']>[2]
	)) as T;
}
