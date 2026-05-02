import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { makeDb } from '$lib/server/db/client';
import { user, userProfile } from '../../../../db/schema';
import { DEV_USER_COOKIE } from '$lib/server/auth/dev-user';

const GUEST_PREFIX = 'guest_';
const GUEST_ID_BYTES = 6;

function generateGuestId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(GUEST_ID_BYTES));
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return `${GUEST_PREFIX}${hex}`;
}

function isPlausibleGuestId(id: string): boolean {
	return /^guest_[0-9a-f]{6,32}$/.test(id);
}

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	if (!platform?.env) error(500, 'platform unavailable');
	const env = platform.env;

	const body = (await request.json().catch(() => ({}))) as {
		id?: unknown;
		language?: unknown;
	};
	const requestedId =
		typeof body.id === 'string' && body.id.trim().length > 0 ? body.id.trim() : null;
	const language = body.language === 'en' || body.language === 'it' ? body.language : 'it';

	const db = makeDb(env.DB);
	let userId: string;
	let isNew = false;

	if (requestedId) {
		if (!isPlausibleGuestId(requestedId)) error(400, 'invalid guest id format');
		const found = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.id, requestedId))
			.limit(1);
		if (found.length === 0) error(404, 'guest id not found');
		userId = requestedId;
	} else {
		userId = generateGuestId();
		isNew = true;
		await db
			.insert(user)
			.values({
				id: userId,
				email: `${userId}@guest.local`,
				emailVerified: true,
				name: userId,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.onConflictDoNothing();
		await db
			.insert(userProfile)
			.values({
				userId,
				language,
				isNpc: false,
				createdAt: Date.now(),
				updatedAt: Date.now()
			})
			.onConflictDoNothing();
	}

	cookies.set(DEV_USER_COOKIE, userId, {
		path: '/',
		httpOnly: true,
		secure: env.ENVIRONMENT === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});

	return json({ id: userId, isNew });
};
