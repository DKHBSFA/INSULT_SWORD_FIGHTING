import type { VectorizeIndex } from '@cloudflare/workers-types';

export type PoolEnv = { POOL_VECTORS: VectorizeIndex };

export type QueryInput = {
	vector: number[];
	userId: string;
	kind: 'attack' | 'defense';
	topK: number;
};

export async function queryPoolVectors(
	env: PoolEnv,
	input: QueryInput
): Promise<{ entryId: string; score: number }[]> {
	if (!input.userId) throw new Error('userId required for tenant isolation');
	if (!['attack', 'defense'].includes(input.kind))
		throw new Error('kind required and must be attack|defense');
	const result = await env.POOL_VECTORS.query(input.vector, {
		topK: input.topK,
		filter: { user_id: input.userId, kind: input.kind },
		returnMetadata: true
	});
	return result.matches.map((m) => ({
		entryId: (m.metadata?.entry_id as string) ?? m.id,
		score: m.score
	}));
}

export async function insertPoolVector(
	env: PoolEnv,
	v: { entryId: string; vector: number[]; userId: string; kind: 'attack' | 'defense' }
): Promise<void> {
	await env.POOL_VECTORS.insert([
		{
			id: v.entryId,
			values: v.vector,
			metadata: { entry_id: v.entryId, user_id: v.userId, kind: v.kind }
		}
	]);
}

export async function deletePoolVectors(env: PoolEnv, ids: string[]): Promise<void> {
	if (ids.length === 0) return;
	await env.POOL_VECTORS.deleteByIds(ids);
}
