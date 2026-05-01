import { test, expect } from '@playwright/test';

test.skip(!process.env.E2E_ENABLED, 'requires staging deploy or local preview with bindings');

test('lands and can navigate to login', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toContainText(/Insult Sword|Insult/);
	await page.click('text=Login');
	await expect(page).toHaveURL(/\/login/);
});
