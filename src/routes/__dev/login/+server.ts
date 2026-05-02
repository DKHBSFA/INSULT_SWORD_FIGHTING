import type { RequestHandler } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { makeDb } from '$lib/server/db/client';
import { user, userProfile } from '../../../../db/schema';
import { DEV_USER_COOKIE } from '$lib/server/auth/dev-user';

export const GET: RequestHandler = async ({ url, platform, cookies }) => {
	if (!platform?.env) error(500, 'platform unavailable');
	const env = platform.env;
	if (env.ENVIRONMENT === 'production') error(404, 'not found');

	const userId = url.searchParams.get('user') ?? 'p1';
	const db = makeDb(env.DB);

	await db
		.insert(user)
		.values({
			id: userId,
			email: `${userId}@dev.local`,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.onConflictDoNothing();
	const lang = (url.searchParams.get('lang') ?? 'it') as 'en' | 'it';
	await db
		.insert(userProfile)
		.values({
			userId,
			language: lang,
			isNpc: false,
			createdAt: Date.now(),
			updatedAt: Date.now()
		})
		.onConflictDoNothing();
	await db.update(userProfile).set({ language: lang }).where(eq(userProfile.userId, userId));

	cookies.set(DEV_USER_COOKIE, userId, {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7
	});
	redirect(303, '/hub');
};
