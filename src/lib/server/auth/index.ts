import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import type { KVNamespace } from '@cloudflare/workers-types';
import type { AppDb } from '../db/client';
import type { EmailProvider } from '../email/provider';

export type AuthEnv = {
	db: AppDb;
	emailProvider: EmailProvider;
	baseUrl: string;
	kv: KVNamespace;
	defaultLanguage: 'en' | 'it';
	secret: string;
};

export function makeAuth(env: AuthEnv) {
	return betterAuth({
		secret: env.secret,
		database: drizzleAdapter(env.db, { provider: 'sqlite' }),
		secondaryStorage: {
			get: async (key) => env.kv.get(key),
			set: async (key, value, ttl) => {
				if (ttl && ttl > 0) {
					await env.kv.put(key, value, { expirationTtl: ttl });
				} else {
					await env.kv.put(key, value);
				}
			},
			delete: async (key) => {
				await env.kv.delete(key);
			}
		},
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					await env.emailProvider.sendMagicLink({
						to: email,
						link: url,
						language: env.defaultLanguage
					});
				}
			})
		],
		rateLimit: {
			window: 60 * 60,
			max: 10,
			customRules: { '/sign-in/magic-link/send': { window: 60 * 60, max: 5 } }
		},
		baseURL: env.baseUrl
	});
}
