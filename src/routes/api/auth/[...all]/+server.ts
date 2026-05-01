import type { RequestHandler } from './$types';
import { makeAuth } from '$lib/server/auth';
import { makeDb } from '$lib/server/db/client';
import { ResendEmailProvider } from '$lib/server/email/resend';
import { MockEmailProvider } from '$lib/server/email/mock';
import { detectLanguage } from '$lib/server/i18n';
import type { EmailProvider } from '$lib/server/email/provider';

const handler: RequestHandler = async ({ request, platform, url }) => {
	if (!platform?.env) throw new Error('platform.env unavailable');
	const env = platform.env;
	const db = makeDb(env.DB);
	const emailProvider: EmailProvider =
		env.ENVIRONMENT === 'production' && 'RESEND_API_KEY' in env && 'RESEND_FROM' in env
			? new ResendEmailProvider(env.RESEND_API_KEY as string, env.RESEND_FROM as string)
			: new MockEmailProvider();
	const secret = ('AUTH_SECRET' in env && (env.AUTH_SECRET as string)) || 'dev-secret-change-me';
	const auth = makeAuth({
		db,
		emailProvider,
		baseUrl: url.origin,
		kv: env.KV,
		defaultLanguage: detectLanguage(request.headers.get('accept-language')),
		secret
	});
	return auth.handler(request);
};

export const GET = handler;
export const POST = handler;
