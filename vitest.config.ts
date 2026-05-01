import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: './wrangler.toml' }
		})
	],
	test: {
		setupFiles: ['./tests/unit/setup.ts'],
		include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts']
	}
});
