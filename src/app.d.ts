// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {
	D1Database,
	KVNamespace,
	VectorizeIndex,
	Ai,
	Fetcher,
	ExecutionContext,
	IncomingRequestCfProperties
} from '@cloudflare/workers-types';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				KV: KVNamespace;
				POOL_VECTORS?: VectorizeIndex;
				AI?: Ai;
				ASSETS: Fetcher;
				ENVIRONMENT: 'development' | 'staging' | 'production';
				AUTH_SECRET?: string;
				RESEND_API_KEY?: string;
				RESEND_FROM?: string;
				AI_GATEWAY_ID?: string;
				ANTHROPIC_API_KEY?: string;
			};
			cf?: IncomingRequestCfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
