import type { D1Database, KVNamespace, VectorizeIndex, Ai } from '@cloudflare/workers-types';
import { eq } from 'drizzle-orm';
import { user, userProfile, opponentPersonas, attackPool, defensePool, scenes } from '../schema';
import { personas } from './personas';
import { seeds } from './pools';
import { scenesSeed } from './scenes';
import { canonicalize } from '../../src/lib/server/pool/normalize';
import { newUlid } from '../../src/lib/server/db/ulid';
import { makeDb } from '../../src/lib/server/db/client';
import { embedText } from '../../src/lib/server/llm/embedding';
import { extractFeatures } from '../../src/lib/server/llm/features';
import { insertPoolVector } from '../../src/lib/server/pool/search';
import type { GatewayEnv } from '../../src/lib/server/llm/gateway';
import type { PoolEnv } from '../../src/lib/server/pool/search';

type SeedEnv = {
	DB: D1Database;
	KV?: KVNamespace;
	POOL_VECTORS?: VectorizeIndex;
	AI?: Ai;
	ENVIRONMENT: string;
	ADMIN_TOKEN?: string;
};

export default {
	async fetch(req: Request, env: SeedEnv): Promise<Response> {
		const url = new URL(req.url);
		if (url.pathname !== '/admin/seed') return new Response('not found', { status: 404 });
		if (!env.ADMIN_TOKEN || req.headers.get('X-Admin-Token') !== env.ADMIN_TOKEN) {
			return new Response('forbidden', { status: 403 });
		}

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

		const llmEnv = env as unknown as GatewayEnv & PoolEnv;
		const canEnrich = !!env.AI && !!env.POOL_VECTORS;
		let inserted = 0;
		let enriched = 0;

		for (const p of personas) {
			const personaSeeds = (seeds as Record<string, { attack: string[]; defense: string[] }>)[p.id];
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
							.set({
								featuresJson: JSON.stringify(features),
								embeddingId: id
							})
							.where(eq(table.id, id));
						enriched++;
					} catch (e) {
						console.error('seed enrichment failed', id, e);
					}
				}
			}
		}

		return new Response(
			JSON.stringify({
				ok: true,
				inserted,
				enriched,
				canEnrich
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
