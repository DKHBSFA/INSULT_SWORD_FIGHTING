import { eq, and, isNull, notInArray, inArray } from 'drizzle-orm';
import { attackPool, defensePool } from '../../../../db/schema';
import { embedText } from '../llm/embedding';
import { generateOpponent } from '../llm/opponent';
import { queryPoolVectors, type PoolEnv } from '../pool/search';
import type { GatewayEnv } from '../llm/gateway';
import type { AppDb } from '../db/client';

export async function pickNpcDeterministic(
	db: AppDb,
	input: { npcUserId: string; kind: 'attack' | 'defense'; exclude: string[] }
): Promise<{ id: string; text: string } | null> {
	const table = input.kind === 'attack' ? attackPool : defensePool;
	const conditions = [eq(table.userId, input.npcUserId), isNull(table.deletedAt)];
	if (input.exclude.length > 0) conditions.push(notInArray(table.id, input.exclude));
	const rows = await db
		.select({ id: table.id, text: table.text })
		.from(table)
		.where(and(...conditions));
	if (rows.length === 0) return null;
	const idx = Math.floor(Math.random() * rows.length);
	return rows[idx]!;
}

export type NpcLlmInput = {
	npcUserId: string;
	personaDescription: string;
	role: 'attacker' | 'defender';
	lastUserText: string;
	mirrorLanguage: 'en' | 'it';
};

export async function generateNpcLlm(
	db: AppDb,
	env: GatewayEnv & PoolEnv,
	input: NpcLlmInput
): Promise<{ text: string; modelId: string }> {
	const queryText = input.lastUserText || input.personaDescription;
	const vec = await embedText(env, queryText);

	const kind: 'attack' | 'defense' = input.role === 'attacker' ? 'attack' : 'defense';
	const matches = await queryPoolVectors(env, {
		vector: vec,
		userId: input.npcUserId,
		kind,
		topK: 5
	});

	const fewShot: { kind: 'attack' | 'defense'; text: string }[] = [];
	if (matches.length > 0) {
		const table = kind === 'attack' ? attackPool : defensePool;
		const rows = await db
			.select({ id: table.id, text: table.text })
			.from(table)
			.where(
				inArray(
					table.id,
					matches.map((m) => m.entryId)
				)
			);
		for (const r of rows) fewShot.push({ kind, text: r.text });
	}

	return generateOpponent(env, {
		role: input.role,
		personaDescription: input.personaDescription,
		fewShot,
		lastUserText: input.lastUserText,
		mirrorLanguage: input.mirrorLanguage
	});
}
