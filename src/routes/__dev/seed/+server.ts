import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { makeDb } from '$lib/server/db/client';
import {
	user,
	userProfile,
	opponentPersonas,
	attackPool,
	defensePool,
	scenes
} from '../../../../db/schema';
import { personas } from '../../../../db/seed/personas';
import { seeds } from '../../../../db/seed/pools';
import { scenesSeed } from '../../../../db/seed/scenes';
import { canonicalize } from '$lib/server/pool/normalize';
import { newUlid } from '$lib/server/db/ulid';
import { embedText } from '$lib/server/llm/embedding';
import { extractFeatures } from '$lib/server/llm/features';
import { insertPoolVector } from '$lib/server/pool/search';
import type { GatewayEnv } from '$lib/server/llm/gateway';
import type { PoolEnv } from '$lib/server/pool/search';
import { getVectorizeBinding } from '$lib/server/pool/vectorize-mock';

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env) error(500, 'platform unavailable');
	const env = platform.env;
	if (env.ENVIRONMENT === 'production') error(404, 'not found');

	const db = makeDb(env.DB);
	const now = new Date();
	const nowMs = Date.now();

	for (const p of personas) {
		await db
			.insert(user)
			.values({
				id: p.userId,
				email: p.email,
				emailVerified: true,
				createdAt: now,
				updatedAt: now
			})
			.onConflictDoNothing();
		await db
			.insert(userProfile)
			.values({
				userId: p.userId,
				language: 'en',
				isNpc: true,
				createdAt: nowMs,
				updatedAt: nowMs
			})
			.onConflictDoNothing();
		await db
			.insert(opponentPersonas)
			.values({
				id: p.id,
				userId: p.userId,
				name: p.name,
				description: p.description,
				spriteSetUrl: p.spriteSetUrl,
				poolMode: p.poolMode,
				active: true
			})
			.onConflictDoNothing();
	}

	for (const s of scenesSeed) {
		await db
			.insert(scenes)
			.values({ ...s, createdAt: nowMs })
			.onConflictDoNothing();
	}

	const vectorize = getVectorizeBinding(env);
	const llmEnv = {
		...env,
		POOL_VECTORS: vectorize
	} as unknown as GatewayEnv & PoolEnv;
	const canEnrich = !!env.ANTHROPIC_API_KEY || !!env.AI;
	let inserted = 0;
	let enriched = 0;

	for (const p of personas) {
		const personaSeeds = (
			seeds as unknown as Record<string, { attack: readonly string[]; defense: readonly string[] }>
		)[p.id];
		if (!personaSeeds) continue;
		for (const kind of ['attack', 'defense'] as const) {
			const table = kind === 'attack' ? attackPool : defensePool;
			for (const text of personaSeeds[kind]) {
				const id = newUlid();
				const norm = canonicalize(text);
				try {
					await db.insert(table).values({
						id,
						userId: p.userId,
						text,
						normalized: norm,
						source: 'seed',
						createdAt: nowMs
					});
					inserted++;
				} catch {
					continue;
				}
				if (!canEnrich) continue;
				try {
					const features = await extractFeatures(llmEnv, text);
					const vec = await embedText(llmEnv, text);
					await insertPoolVector(llmEnv, {
						entryId: id,
						vector: vec,
						userId: p.userId,
						kind
					});
					await db
						.update(table)
						.set({ featuresJson: JSON.stringify(features), embeddingId: id })
						.where(eq(table.id, id));
					enriched++;
				} catch (e) {
					console.error('seed enrichment failed', id, e);
				}
			}
		}
	}

	return json({ ok: true, inserted, enriched, canEnrich });
};
