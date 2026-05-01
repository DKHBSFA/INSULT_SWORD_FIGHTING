import type {
	VectorizeIndex,
	VectorizeMatches,
	VectorizeMatch,
	VectorizeQueryOptions,
	VectorizeVector,
	VectorizeVectorMutation
} from '@cloudflare/workers-types';

type Stored = { id: string; values: number[]; metadata?: Record<string, unknown> | undefined };

function cosineSim(a: number[], b: number[]): number {
	if (a.length !== b.length) return 0;
	let dot = 0;
	let na = 0;
	let nb = 0;
	for (let i = 0; i < a.length; i++) {
		const ai = a[i] ?? 0;
		const bi = b[i] ?? 0;
		dot += ai * bi;
		na += ai * ai;
		nb += bi * bi;
	}
	const denom = Math.sqrt(na) * Math.sqrt(nb);
	return denom === 0 ? 0 : dot / denom;
}

function metaMatches(meta: Record<string, unknown> | undefined, filter: unknown): boolean {
	if (!filter || typeof filter !== 'object') return true;
	if (!meta) return false;
	for (const [k, v] of Object.entries(filter as Record<string, unknown>)) {
		if (meta[k] !== v) return false;
	}
	return true;
}

class VectorizeMockImpl {
	private store = new Map<string, Stored>();

	async query(
		vector: number[] | Float32Array | Float64Array,
		options?: VectorizeQueryOptions
	): Promise<VectorizeMatches> {
		const arr = Array.from(vector);
		const filter = options?.filter;
		const topK = options?.topK ?? 5;
		const matches: VectorizeMatch[] = Array.from(this.store.values())
			.filter((v) => metaMatches(v.metadata, filter))
			.map((v) => {
				const m: VectorizeMatch = {
					id: v.id,
					score: cosineSim(arr, v.values)
				};
				if (options?.returnValues) m.values = v.values;
				if (options?.returnMetadata && v.metadata) {
					m.metadata = v.metadata as NonNullable<VectorizeMatch['metadata']>;
				}
				return m;
			})
			.sort((a, b) => b.score - a.score)
			.slice(0, topK);
		return { matches, count: matches.length };
	}

	async insert(vectors: VectorizeVector[]): Promise<VectorizeVectorMutation> {
		const ids: string[] = [];
		for (const v of vectors) {
			if (this.store.has(v.id)) continue;
			this.store.set(v.id, {
				id: v.id,
				values: Array.from(v.values),
				metadata: v.metadata as Record<string, unknown> | undefined
			});
			ids.push(v.id);
		}
		return { ids, count: ids.length };
	}

	async upsert(vectors: VectorizeVector[]): Promise<VectorizeVectorMutation> {
		const ids: string[] = [];
		for (const v of vectors) {
			this.store.set(v.id, {
				id: v.id,
				values: Array.from(v.values),
				metadata: v.metadata as Record<string, unknown> | undefined
			});
			ids.push(v.id);
		}
		return { ids, count: ids.length };
	}

	async deleteByIds(ids: string[]): Promise<VectorizeVectorMutation> {
		const deleted: string[] = [];
		for (const id of ids) {
			if (this.store.delete(id)) deleted.push(id);
		}
		return { ids: deleted, count: deleted.length };
	}

	async getByIds(ids: string[]): Promise<VectorizeVector[]> {
		return ids
			.map((id) => this.store.get(id))
			.filter((v): v is Stored => !!v)
			.map((v) => {
				const out: VectorizeVector = { id: v.id, values: v.values };
				if (v.metadata) out.metadata = v.metadata as NonNullable<VectorizeVector['metadata']>;
				return out;
			});
	}

	describe(): never {
		throw new Error('describe not implemented in mock');
	}
}

const singleton = new VectorizeMockImpl();

export function getVectorizeBinding(env: {
	POOL_VECTORS?: VectorizeIndex;
	ENVIRONMENT: string;
}): VectorizeIndex {
	if (env.ENVIRONMENT === 'production' || env.ENVIRONMENT === 'staging') {
		if (!env.POOL_VECTORS) throw new Error('POOL_VECTORS binding required in non-dev env');
		return env.POOL_VECTORS;
	}
	return singleton as unknown as VectorizeIndex;
}
