import { eq, and, isNull } from 'drizzle-orm';
import { attackPool, defensePool } from '../../../../db/schema';
import { canonicalize } from './normalize';
import { newUlid } from '../db/ulid';
import type { AppDb } from '../db/client';
import { embedText } from '../llm/embedding';
import { extractFeatures } from '../llm/features';
import { insertPoolVector, type PoolEnv } from './search';
import type { GatewayEnv } from '../llm/gateway';

export type SaveEntryInput = {
	userId: string;
	kind: 'attack' | 'defense';
	text: string;
	source: 'manual' | 'auto_won' | 'seed' | 'learned_from_user';
	learnedFromUserId?: string;
};

export async function saveEntry(db: AppDb, input: SaveEntryInput): Promise<string> {
	const table = input.kind === 'attack' ? attackPool : defensePool;
	const normalized = canonicalize(input.text);

	const existing = await db
		.select({ id: table.id })
		.from(table)
		.where(
			and(eq(table.userId, input.userId), eq(table.normalized, normalized), isNull(table.deletedAt))
		)
		.limit(1);
	if (existing.length > 0) return existing[0]!.id;

	const id = newUlid();
	const now = Date.now();
	try {
		if (input.kind === 'attack') {
			if (input.source === 'auto_won') throw new Error('auto_won is invalid for attack_pool');
			await db.insert(attackPool).values({
				id,
				userId: input.userId,
				text: input.text,
				normalized,
				source: input.source,
				learnedFromUserId: input.learnedFromUserId ?? null,
				createdAt: now
			});
		} else {
			await db.insert(defensePool).values({
				id,
				userId: input.userId,
				text: input.text,
				normalized,
				source: input.source,
				learnedFromUserId: input.learnedFromUserId ?? null,
				createdAt: now
			});
		}
		return id;
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg.includes('UNIQUE')) {
			const fallback = await db
				.select({ id: table.id })
				.from(table)
				.where(
					and(
						eq(table.userId, input.userId),
						eq(table.normalized, normalized),
						isNull(table.deletedAt)
					)
				)
				.limit(1);
			if (fallback[0]) return fallback[0].id;
		}
		throw e;
	}
}

export async function saveEntryWithBackfill(
	db: AppDb,
	env: GatewayEnv & PoolEnv,
	ctx: { waitUntil: (p: Promise<unknown>) => void },
	input: SaveEntryInput
): Promise<string> {
	const id = await saveEntry(db, input);
	ctx.waitUntil(
		(async () => {
			try {
				const features = await extractFeatures(env, input.text);
				const vector = await embedText(env, input.text);
				await insertPoolVector(env, {
					entryId: id,
					vector,
					userId: input.userId,
					kind: input.kind
				});
				const table = input.kind === 'attack' ? attackPool : defensePool;
				await db
					.update(table)
					.set({ featuresJson: JSON.stringify(features), embeddingId: id })
					.where(eq(table.id, id));
			} catch (e) {
				console.error('entry backfill failed (will retry via cron):', id, e);
			}
		})()
	);
	return id;
}
