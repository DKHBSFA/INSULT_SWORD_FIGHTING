import type { PageServerLoad } from './$types';
import { makeDb } from '$lib/server/db/client';
import { opponentPersonas } from '../../../db/schema';
import { eq, and, ne } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env) return { personas: [] };
	const env = platform.env;
	const db = makeDb(env.DB);
	const personas = await db
		.select()
		.from(opponentPersonas)
		.where(and(eq(opponentPersonas.active, true), ne(opponentPersonas.poolMode, 'fixed')));
	return { personas };
};
