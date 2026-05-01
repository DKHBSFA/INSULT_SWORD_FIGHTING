import { describe, it, expect, vi } from 'vitest';
import { applyLearning, type Turn } from '../../../src/lib/server/game/learning';
import type { AppDb } from '../../../src/lib/server/db/client';
import type { GatewayEnv } from '../../../src/lib/server/llm/gateway';
import type { PoolEnv } from '../../../src/lib/server/pool/search';
import type { SaveEntryInput } from '../../../src/lib/server/pool/save';

describe('applyLearning', () => {
	it('saves player attack to NPC adaptive pool', async () => {
		const db = {} as unknown as AppDb;
		const env = {} as unknown as GatewayEnv & PoolEnv;
		const ctx = { waitUntil: vi.fn() };
		const calls: SaveEntryInput[] = [];
		const fakeSave = (
			_db: AppDb,
			_env: GatewayEnv & PoolEnv,
			_ctx: { waitUntil: (p: Promise<unknown>) => void },
			input: SaveEntryInput
		): Promise<string> => {
			calls.push(input);
			return Promise.resolve('saved');
		};
		const turn: Turn = {
			attacker: 'user',
			attackText: 'YOU SCURVY DOG',
			defenseText: 'I know you are',
			judgment: 'defender_wins'
		};
		await applyLearning({
			db,
			env,
			ctx,
			saveFn: fakeSave,
			turn,
			userId: 'p1',
			npcUserId: 'brutus',
			npcPoolMode: 'adaptive'
		});
		const npcAttackSave = calls.find((c) => c.userId === 'brutus' && c.kind === 'attack');
		expect(npcAttackSave).toBeDefined();
		expect(npcAttackSave?.source).toBe('learned_from_user');
	});
});
