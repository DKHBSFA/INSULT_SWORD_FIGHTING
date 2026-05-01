import { isNull, eq } from 'drizzle-orm';
import { attackPool, defensePool } from '../../../../db/schema';
import { embedText } from '../llm/embedding';
import { extractFeatures } from '../llm/features';
import { insertPoolVector, type PoolEnv } from './search';
import type { GatewayEnv } from '../llm/gateway';
import type { AppDb } from '../db/client';

export async function backfillEntries(
	db: AppDb,
	env: GatewayEnv & PoolEnv,
	limit: number
): Promise<number> {
	let processed = 0;
	for (const table of [attackPool, defensePool] as const) {
		const rows = await db.select().from(table).where(isNull(table.embeddingId)).limit(limit);
		for (const row of rows) {
			try {
				const features = await extractFeatures(env, row.text);
				const vector = await embedText(env, row.text);
				await insertPoolVector(env, {
					entryId: row.id,
					vector,
					userId: row.userId,
					kind: table === attackPool ? 'attack' : 'defense'
				});
				await db
					.update(table)
					.set({ featuresJson: JSON.stringify(features), embeddingId: row.id })
					.where(eq(table.id, row.id));
				processed++;
			} catch (e) {
				console.error('backfill row failed:', row.id, e);
			}
		}
	}
	return processed;
}
