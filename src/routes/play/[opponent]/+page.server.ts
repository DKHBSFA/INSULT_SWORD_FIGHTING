import type { PageServerLoad } from './$types';
import { makeDb } from '$lib/server/db/client';
import { opponentPersonas } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env) error(500, 'platform unavailable');
	const env = platform.env;
	const db = makeDb(env.DB);
	const p = (
		await db
			.select()
			.from(opponentPersonas)
			.where(eq(opponentPersonas.id, params.opponent))
			.limit(1)
	)[0];
	if (!p) error(404, 'opponent not found');
	return { opponentUserId: p.userId, opponentSlug: p.id };
};
