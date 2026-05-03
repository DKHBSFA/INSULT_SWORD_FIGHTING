import type { AppDb } from '../db/client';
import type { GatewayEnv } from '../llm/gateway';
import type { PoolEnv } from '../pool/search';
import type { SaveEntryInput } from '../pool/save';

export type Turn = {
	attacker: 'user' | 'opponent';
	attackText: string;
	defenseText: string | null;
	judgment: 'attacker_wins' | 'defender_wins' | 'tie' | 'timeout';
};

type SaveFn = (
	db: AppDb,
	env: GatewayEnv & PoolEnv,
	ctx: { waitUntil: (p: Promise<unknown>) => void },
	input: SaveEntryInput
) => Promise<string>;

export async function applyLearning(opts: {
	db: AppDb;
	env: GatewayEnv & PoolEnv & { ENABLE_LEARNING?: string };
	ctx: { waitUntil: (p: Promise<unknown>) => void };
	saveFn: SaveFn;
	turn: Turn;
	userId: string;
	npcUserId: string;
	npcPoolMode: 'fixed' | 'adaptive';
}) {
	// Runtime learning consumes Workers AI Neurons per turn (embedding +
	// features for every save). Default-off in production; enable per-env via
	// wrangler.toml `ENABLE_LEARNING = "true"` once the LLM-author offline
	// pipeline is in place.
	if (opts.env.ENABLE_LEARNING !== 'true') return;
	const { turn } = opts;

	if (turn.attacker === 'opponent' && turn.judgment === 'defender_wins' && turn.defenseText) {
		await opts.saveFn(opts.db, opts.env, opts.ctx, {
			userId: opts.userId,
			kind: 'defense',
			text: turn.defenseText,
			source: 'auto_won'
		});
	}

	if (opts.npcPoolMode === 'adaptive') {
		if (turn.attacker === 'user' && turn.attackText) {
			await opts.saveFn(opts.db, opts.env, opts.ctx, {
				userId: opts.npcUserId,
				kind: 'attack',
				text: turn.attackText,
				source: 'learned_from_user',
				learnedFromUserId: opts.userId
			});
		}
		if (turn.attacker === 'opponent' && turn.judgment === 'defender_wins' && turn.defenseText) {
			await opts.saveFn(opts.db, opts.env, opts.ctx, {
				userId: opts.npcUserId,
				kind: 'defense',
				text: turn.defenseText,
				source: 'learned_from_user',
				learnedFromUserId: opts.userId
			});
		}
	}
}
