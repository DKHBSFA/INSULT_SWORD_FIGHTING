// Visual smoke test against the deployed production worker.
// Visits each major page, takes a full-page screenshot, captures console errors.
// Output: /tmp/isf-screens/*.png + errors.json
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'https://isf.rm9417686.workers.dev';
const GUEST_ID = process.env.GUEST_ID ?? 'guest_087a29977f1d';
const OUT = '/tmp/isf-screens';

const PAGES = [
	{ name: 'login', path: '/login' },
	{ name: 'hub', path: '/hub' },
	{ name: 'play', path: '/play' },
	{ name: 'leaderboard', path: '/leaderboard' },
	{ name: 'pool', path: '/pool' },
	{ name: 'tutorial', path: '/tutorial' },
	{ name: 'profile', path: '/profile' }
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const url = new URL(BASE);
await context.addCookies([
	{ name: 'isf_dev_user', value: GUEST_ID, domain: url.hostname, path: '/' }
]);

const results = {};

for (const p of PAGES) {
	const page = await context.newPage();
	const errors = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});
	page.on('pageerror', (err) => errors.push('PAGE_ERROR: ' + err.message));
	page.on('requestfailed', (req) =>
		errors.push(`REQUEST_FAILED: ${req.method()} ${req.url()} — ${req.failure()?.errorText}`)
	);

	let status = 0;
	let finalUrl = '';
	try {
		const resp = await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 20000 });
		status = resp?.status() ?? 0;
		finalUrl = page.url();
		await page.waitForTimeout(1500);
		const fontInfo = await page.evaluate(() => {
			const h1 = document.querySelector('h1');
			const h2 = document.querySelector('h2');
			return {
				h1: h1 ? getComputedStyle(h1).fontFamily : null,
				h2: h2 ? getComputedStyle(h2).fontFamily : null,
				bodyLoaded: document.fonts ? document.fonts.check('12px "Press Start 2P"') : null
			};
		});
		console.log(`  fonts:`, JSON.stringify(fontInfo));
		await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
	} catch (e) {
		errors.push('NAV_ERROR: ' + (e instanceof Error ? e.message : String(e)));
	}
	results[p.name] = { status, finalUrl, errors };
	console.log(`[${p.name}] HTTP ${status} → ${finalUrl}  (${errors.length} err)`);
	await page.close();
}

writeFileSync(`${OUT}/errors.json`, JSON.stringify(results, null, 2));
await browser.close();
console.log(`\nScreenshots in ${OUT}`);
