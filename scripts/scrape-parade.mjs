// Scrapes https://parade.com/living/funny-insults for insult list content.
// Output: references/parade-funny-insults.json with the page's headings and
// adjacent paragraphs (typical structure for listicles).
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = 'https://parade.com/living/funny-insults';
const OUT_DIR = 'references';
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
	headless: true,
	args: ['--disable-blink-features=AutomationControlled']
});
const ctx = await browser.newContext({
	userAgent:
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
	viewport: { width: 1280, height: 900 },
	locale: 'en-US',
	timezoneId: 'America/New_York',
	extraHTTPHeaders: {
		'Accept':
			'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.5',
		'Accept-Encoding': 'gzip, deflate, br',
		'Upgrade-Insecure-Requests': '1',
		'Sec-Fetch-Dest': 'document',
		'Sec-Fetch-Mode': 'navigate',
		'Sec-Fetch-Site': 'none',
		'Sec-Fetch-User': '?1'
	}
});
// Hide webdriver flag
await ctx.addInitScript(() => {
	Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});
const page = await ctx.newPage();

console.log(`Navigating to ${URL} …`);
const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
console.log(`HTTP ${resp?.status()}`);

await page.waitForTimeout(4000);
// Scroll to trigger any lazy-loaded content
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
await page.waitForTimeout(2000);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2000);

const data = await page.evaluate(() => {
	const result = {
		url: location.href,
		title: document.title,
		extracted: []
	};
	// Listicle structure: typically <h2>, <h3> with insult text, followed by <p> for context.
	// Also try <ol>/<ul> <li> capture.
	const candidates = document.querySelectorAll('article h2, article h3, article p, article li');
	let current = null;
	for (const el of candidates) {
		const text = (el.textContent || '').trim();
		if (text.length === 0 || text.length > 600) continue;
		const tag = el.tagName.toLowerCase();
		if (tag === 'h2' || tag === 'h3') {
			current = { heading: text, body: [] };
			result.extracted.push(current);
		} else if (current) {
			current.body.push(text);
		} else {
			result.extracted.push({ heading: null, body: [text] });
		}
	}
	return result;
});

writeFileSync(`${OUT_DIR}/parade-funny-insults.json`, JSON.stringify(data, null, 2));
console.log(`Saved ${data.extracted.length} blocks → ${OUT_DIR}/parade-funny-insults.json`);

await browser.close();
