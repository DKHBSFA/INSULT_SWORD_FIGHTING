import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from '../../../../db/schema';

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

export function makeDb(d1: D1Database): AppDb {
	return drizzle(d1 as unknown as Parameters<typeof drizzle>[0], { schema });
}
