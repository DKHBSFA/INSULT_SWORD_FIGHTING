import type {
	D1Database,
	KVNamespace,
	VectorizeIndex,
	Ai,
	ScheduledEvent,
	ExecutionContext
} from '@cloudflare/workers-types';
import { autoAbandonStaleChallenges } from './lib/server/crons/auto-abandon';
import { backfillEntries } from './lib/server/pool/backfill';
import { makeDb } from './lib/server/db/client';
import type { GatewayEnv } from './lib/server/llm/gateway';
import type { PoolEnv } from './lib/server/pool/search';

type CronEnv = {
	DB: D1Database;
	KV: KVNamespace;
	POOL_VECTORS: VectorizeIndex;
	AI: Ai;
	ENVIRONMENT: string;
	AI_GATEWAY_ID?: string;
};

export default {
	async scheduled(event: ScheduledEvent, env: CronEnv, ctx: ExecutionContext): Promise<void> {
		void ctx;
		const db = makeDb(env.DB);
		if (event.cron === '* * * * *') {
			const n = await autoAbandonStaleChallenges(db);
			console.log(`[cron] auto-abandoned ${n} stale challenges`);
		} else if (event.cron === '0 * * * *') {
			const llmEnv = env as unknown as GatewayEnv & PoolEnv;
			const n = await backfillEntries(db, llmEnv, 100);
			console.log(`[cron] backfilled ${n} pool entries`);
		}
	}
};
