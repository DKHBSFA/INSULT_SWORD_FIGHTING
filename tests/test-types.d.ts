declare module 'cloudflare:test' {
	import type { D1Database, Fetcher, ExecutionContext } from '@cloudflare/workers-types';

	type CloudflareEnv = {
		DB: D1Database;
		KV: import('@cloudflare/workers-types').KVNamespace;
		AI?: import('@cloudflare/workers-types').Ai;
		POOL_VECTORS?: import('@cloudflare/workers-types').VectorizeIndex;
		ASSETS: Fetcher;
		ENVIRONMENT: string;
	};

	export const env: CloudflareEnv;
	export const SELF: Fetcher;
	export const ctx: ExecutionContext;

	export function applyD1Migrations(
		db: D1Database,
		migrations: { name: string; queries: string[] }[]
	): Promise<void>;
}
