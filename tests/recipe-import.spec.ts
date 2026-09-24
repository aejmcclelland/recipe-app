import { test, expect, type Page, type Route } from '@playwright/test';
import type { RecipeResult } from '../types/recipe';

const importPath = '/recipes/copyWeb';
const recipeUrl = 'https://www.bbcgoodfood.com/recipes/test-recipe?ref=family&name=fish%20pie#method';
const preview: RecipeResult = {
	title: 'Imported test recipe',
	ingredients: ['200g flour'],
	steps: ['Mix the ingredients.'],
	image: '',
	sourceUrl: recipeUrl,
};

// Match the existing password-recovery tests: mock action responses, not page rendering.
// No real scraping or recipe writes take place.
async function actionResult(route: Route) {
	await route.fulfill({
		contentType: 'text/x-component',
		body: `0:{"a":"$@1","f":""}\n1:${JSON.stringify(preview)}\n`,
	});
}

async function interceptAction(page: Page, handle: (route: Route) => Promise<void>) {
	await page.route(`**${importPath}*`, async route => {
		if (route.request().method() === 'POST') await handle(route);
		else await route.continue();
	});
}

async function openImport(page: Page, query = '') {
	await Promise.all([
		page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/session'),
		page.goto(`${importPath}${query}`),
	]);
}

test.use({ viewport: { width: 390, height: 844 } });

test('incoming recipe link is decoded once, editable, and waits for explicit import', async ({ page }) => {
	let requests = 0;
	await interceptAction(page, async route => {
		requests++;
		expect(route.request().postData()).toContain(recipeUrl);
		await actionResult(route);
	});
	await openImport(page, `?url=${encodeURIComponent(recipeUrl)}`);
	const input = page.getByRole('textbox', { name: 'Recipe link', exact: true });
	await expect(input).toHaveValue(recipeUrl);
	await expect(input).toBeEditable();
	await expect(page.getByRole('button', { name: 'Import Recipe', exact: true })).toBeEnabled();
	expect(requests).toBe(0);
	await page.getByRole('button', { name: 'Import Recipe', exact: true }).click();
	await expect(page.getByRole('status')).toHaveText(preview.title);
	expect(requests).toBe(1); // Preview only; never automatically saves.
});

for (const query of ['?url=%20', '?url=https://example.com/one&url=https://example.com/two']) {
	test(`empty or repeated incoming values leave manual entry available: ${query}`, async ({ page }) => {
		await openImport(page, query);
		await expect(page.getByRole('textbox', { name: 'Recipe link', exact: true })).toHaveValue('');
		await expect(page.getByRole('button', { name: 'Import Recipe', exact: true })).toBeDisabled();
	});
}

test('manual import clears the old preview on retry, shows safe failure feedback and preserves the link', async ({ page }) => {
	let requests = 0;
	let release: () => void = () => {};
	const gate = new Promise<void>(resolve => { release = resolve; });
	await interceptAction(page, async route => {
		requests++;
		if (requests !== 2) return actionResult(route);
		await gate;
		await route.fulfill({ status: 500, contentType: 'text/plain', body: 'private scraper credentials' });
	});
	await openImport(page);
	const input = page.getByRole('textbox', { name: 'Recipe link', exact: true });
	await input.fill(recipeUrl);
	await page.getByRole('button', { name: 'Import Recipe', exact: true }).click();
	await expect(page.getByRole('status')).toHaveText(preview.title);
	const retryUrl = 'https://www.bbc.co.uk/food/recipes/test-recipe';
	await input.fill(retryUrl);
	await page.getByRole('button', { name: 'Import Recipe', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Importing recipe…' })).toBeDisabled();
	await expect(input).toBeDisabled();
	await expect(page.getByText(preview.ingredients[0], { exact: true })).toHaveCount(0);
	release();
	await expect(page.locator('form').getByRole('alert')).toContainText('We couldn’t import this recipe.');
	await expect(page.locator('form').getByRole('alert')).not.toContainText('private');
	await expect(page.getByRole('status')).toHaveCount(0);
	await expect(input).toHaveValue(retryUrl);
	await expect(input).toBeEditable();
	await page.getByRole('button', { name: 'Import Recipe', exact: true }).click();
	await expect(page.getByRole('status')).toHaveText(preview.title);
	await expect(page.locator('form').getByRole('alert')).toHaveCount(0);
	expect(requests).toBe(3);
});

test('clipboard is read only on a button press and populates the field without importing', async ({ page }) => {
	await page.addInitScript(link => {
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { readText: async () => {
				document.documentElement.dataset.clipboardRead = 'yes';
				return `  ${link}  `;
			} },
		});
	}, recipeUrl);
	let requests = 0;
	await interceptAction(page, async route => { requests++; await route.abort(); });
	await openImport(page);
	await expect(page.locator('html')).not.toHaveAttribute('data-clipboard-read', 'yes');
	await page.getByRole('button', { name: 'Paste recipe link' }).click();
	await expect(page.getByRole('textbox', { name: 'Recipe link', exact: true })).toHaveValue(recipeUrl);
	await expect(page.locator('html')).toHaveAttribute('data-clipboard-read', 'yes');
	await expect(page.getByRole('button', { name: 'Import Recipe', exact: true })).toBeEnabled();
	expect(requests).toBe(0);
});

for (const failure of ['denied', 'unavailable', 'empty']) {
	test(`clipboard ${failure} gives paste guidance and keeps manual input usable`, async ({ page }) => {
		await page.addInitScript(mode => {
			Object.defineProperty(navigator, 'clipboard', {
				configurable: true,
				value: mode === 'unavailable' ? undefined : { readText: async () => {
					if (mode === 'empty') return ' ';
					throw new Error('private clipboard details');
				} },
			});
		}, failure);
		await openImport(page, `?url=${encodeURIComponent(recipeUrl)}`);
		await page.getByRole('button', { name: 'Paste recipe link' }).click();
		await expect(page.locator('form').getByRole('alert')).toContainText(/clipboard/i);
		await expect(page.locator('form').getByRole('alert')).not.toContainText('private');
		const input = page.getByRole('textbox', { name: 'Recipe link', exact: true });
		await expect(input).toHaveValue(recipeUrl);
		await expect(input).toBeEditable();
		await input.fill('https://www.jamieoliver.com/recipes/test-recipe');
		await expect(page.locator('form').getByRole('alert')).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Import Recipe', exact: true })).toBeEnabled();
	});
}
