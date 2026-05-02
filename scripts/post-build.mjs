// Post-build wrapper: takes the SvelteKit-generated _worker.js and merges in
// the scheduled() handler from src/scheduled.ts, since @sveltejs/adapter-cloudflare
// only emits a fetch handler.
//
// Steps:
//   1. Rename the SvelteKit bundle to _sk-worker.js
//   2. Bundle src/scheduled.ts into _scheduled.js via the esbuild CLI (npx)
//   3. Write a tiny wrapper at _worker.js that re-exports both handlers
import { execFileSync } from 'node:child_process';
import { existsSync, renameSync, writeFileSync } from 'node:fs';

const dir = '.svelte-kit/cloudflare';
const src = `${dir}/_worker.js`;
const sk = `${dir}/_sk-worker.js`;
const scheduled = `${dir}/_scheduled.js`;

if (!existsSync(src)) {
	throw new Error(`[post-build] ${src} not found — did vite build run?`);
}

renameSync(src, sk);

execFileSync(
	'npx',
	[
		'-y',
		'esbuild',
		'src/scheduled.ts',
		'--bundle',
		'--format=esm',
		'--platform=browser',
		'--target=es2022',
		`--outfile=${scheduled}`,
		'--external:cloudflare:workers'
	],
	{ stdio: 'inherit' }
);

writeFileSync(
	src,
	`import sveltekitWorker from './_sk-worker.js';
import scheduledModule from './_scheduled.js';

export default {
	fetch: sveltekitWorker.fetch,
	scheduled: scheduledModule.scheduled
};
`
);

console.log('[post-build] wrapped _worker.js with scheduled handler');
