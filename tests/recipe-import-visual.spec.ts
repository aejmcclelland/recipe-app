import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

// Render the actual import route and shell with isolated data/action boundaries.
// No real scraping or recipe writes take place.
const require = createRequire(import.meta.url);
const { build } = require(require.resolve('esbuild', { paths: [require.resolve('tsx')] })) as {
	build(options: Record<string, unknown>): Promise<{ outputFiles: { text: string }[] }>;
};
const importPath = '/recipes/copyWeb';
const fixture = JSON.stringify(path.resolve('tests/fixtures/recipe-import.tsx'));
const shims: Record<string, string> = {
	'@/app/actions/getCategories': `export {getCategories} from ${fixture};`,
	'../app/actions/scrapeData': `export {scrapeData} from ${fixture};`,
	'@/app/actions/saveScrapedRecipe': `export {saveScrapedRecipe} from ${fixture};`,
	'next/navigation': `export {useRouter, usePathname} from ${fixture}; export function useServerInsertedHTML() {}`,
	'next/link': `export {FixtureLink as default} from ${fixture};`,
	'next/image': "export {Image as default} from 'next/dist/client/image-component';",
	'next/font/google': `export function Archivo() {return {style: {fontFamily: document.documentElement.dataset.bodyFont}};} export function Shadows_Into_Light() {return {style: {fontFamily: document.documentElement.dataset.wordmarkFont}};}`,
};
let bundle: string;
let browserErrors: string[];
test.beforeAll(async () => {
	const result = await build({
		entryPoints: ['tests/fixtures/recipe-import.tsx'],
		bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
		loader: { '.js': 'jsx', '.jsx': 'jsx' },
		define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}' },
		plugins: [{
			name: 'import-fixture-boundaries',
			setup(builder: {
				onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
				onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: 'js'; resolveDir: string }): void;
			}) {
				builder.onResolve({ filter: /.*/ }, args => shims[args.path] ? { path: args.path, namespace: 'import-shim' } : undefined);
				builder.onLoad({ filter: /.*/, namespace: 'import-shim' }, args => ({ contents: shims[args.path], loader: 'js', resolveDir: process.cwd() }));
			},
		}],
	});
	bundle = result.outputFiles[0].text;
});
test.beforeEach(async ({ page }) => {
	browserErrors = [];
	page.on('pageerror', error => browserErrors.push(error.message));
	await page.goto('/');
	await expect(page.locator('.site-appbar img')).toBeVisible();
	const appearance = await page.evaluate(() => ({
		styles: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(link => link.outerHTML).join(''),
		bodyFont: getComputedStyle(document.body).fontFamily,
		wordmarkFont: getComputedStyle(document.querySelector('.site-appbar a .MuiTypography-root:last-child')!).fontFamily,
	}));
	await page.route('**/api/auth/**', async route => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith('/csrf')) return route.fulfill({ json: { csrfToken: 'fixture-token' } });
        const body = route.request().method() === 'POST' ? route.request().postDataJSON() : null;
        if (body?.data) await page.evaluate(data => { document.documentElement.dataset.sessionUpdate = JSON.stringify(data); }, body.data);
        return route.fulfill({ json: body?.data ?? { user: { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Rebekah Tester', email: 'rebekah@example.test', image: null }, expires: '2099-01-01T00:00:00.000Z' } });
    });
	await page.route('**/__import-fixture.js', route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
	await page.route(url => url.pathname === importPath, route => route.fulfill({
		contentType: 'text/html',
		body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Import review fixture</title>${appearance.styles}</head><body><div id="root"></div><script>document.documentElement.dataset.bodyFont=${JSON.stringify(appearance.bodyFont)};document.documentElement.dataset.wordmarkFont=${JSON.stringify(appearance.wordmarkFont)};</script><script src="/__import-fixture.js"></script></body></html>`,
	}));
});
test.afterEach(() => expect(browserErrors).toEqual([]));

async function importPreview(page: import('@playwright/test').Page) {
	await page.getByRole('button', { name: 'Import Recipe', exact: true }).click();
	await expect(page.getByRole('status')).toHaveText('Weeknight tomato pasta');
}

test('import remains explicit and transfers primary emphasis to save', async ({ page }) => {
	await page.goto(`${importPath}?url=${encodeURIComponent('https://www.bbcgoodfood.com/recipes/pasta')}`);
	const button = page.getByRole('button', { name: 'Import Recipe', exact: true });
	await expect(button).toHaveClass(/MuiButton-containedPrimary/);
	await expect(page.locator('html')).not.toHaveAttribute('data-scrape-calls');
	await importPreview(page);
	await expect(button).toHaveClass(/MuiButton-outlinedPrimary/);
	await expect(page.getByRole('button', { name: 'Save recipe', exact: true })).toHaveCSS('background-color', 'rgb(26, 32, 39)');
	await expect(page.locator('html')).not.toHaveAttribute('data-save-calls');
	await page.getByRole('button', { name: 'Save recipe', exact: true }).click();
	await expect(page.getByText('Please select a category before saving', { exact: true })).toBeVisible();
	await expect(page.locator('html')).not.toHaveAttribute('data-save-calls');
	await page.getByRole('combobox', { name: 'Category' }).click();
	await page.getByRole('option', { name: 'Pasta', exact: true }).click();
	await page.evaluate(() => { document.documentElement.dataset.saveFailure = 'yes'; });
	await page.getByRole('button', { name: 'Save recipe', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Save recipe', exact: true })).toBeDisabled();
	await page.evaluate(() => window.dispatchEvent(new Event('fixture-save-complete')));
	await expect(page.getByText('Failed to save recipe.', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save recipe', exact: true })).toBeEnabled();
	await page.evaluate(() => { delete document.documentElement.dataset.saveFailure; });
	await page.getByRole('button', { name: 'Save recipe', exact: true }).click();
	await page.evaluate(() => window.dispatchEvent(new Event('fixture-save-complete')));
	await expect(page).toHaveURL('/recipes/cccccccccccccccccccccccc');
	await expect(page.getByText('Recipe saved!', { exact: true })).toBeVisible();
	await expect(page.locator('html')).toHaveAttribute('data-saved-category', 'pasta');
});

test('preview reset, print and PDF retain their actions', async ({ page }) => {
	await page.goto(`${importPath}?url=https://www.bbcgoodfood.com/recipes/pasta`);
	await importPreview(page);
	await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printed = 'yes'; }; });
	await page.getByRole('button', { name: 'Print', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-printed', 'yes');
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export to PDF', exact: true }).click();
	expect((await download).suggestedFilename()).toBe('Weeknight_tomato_pasta.pdf');
	await page.getByRole('button', { name: 'Get another recipe', exact: true }).click();
	await expect(page.getByRole('status')).toHaveCount(0);
	await expect(page.getByRole('textbox', { name: 'Recipe link', exact: true })).toHaveValue('');
	await expect(page.getByRole('button', { name: 'Import Recipe', exact: true })).toBeDisabled();
});

for (const [name, width] of [['desktop', 1440], ['mobile', 390], ['small-mobile', 320], ['tablet', 640]] as const) {
	test(`${name} initial and preview states stay within the viewport`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(`${importPath}?url=https://www.bbcgoodfood.com/recipes/pasta`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Save a recipe from the web');
		await page.evaluate(() => document.fonts.ready);
		await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
		await expect(page.locator('.site-appbar img').first()).toHaveAttribute('src', /logo-face/);
		await expect(page.getByRole('textbox', { name: 'Recipe link', exact: true })).toHaveCSS('padding-left', '14px');
		for (const state of ['initial', 'preview']) {
			if (state === 'preview') {
				await importPreview(page);
				await page.getByRole('combobox', { name: 'Category' }).click();
				await expect(page.getByRole('option', { name: 'Pasta', exact: true })).toBeVisible();
				await page.getByRole('option', { name: 'Pasta', exact: true }).click();
				await expect(page.locator('.MuiPopover-root')).toHaveCount(0);
				await page.waitForFunction(() => Array.from(document.images).every(image => image.complete));
				const ingredients = await page.getByRole('heading', { name: 'Ingredients', exact: true }).boundingBox();
				const method = await page.getByRole('heading', { name: 'Method', exact: true }).boundingBox();
				if (width >= 1024) expect(method!.y).toBe(ingredients!.y);
				else expect(method!.y).toBeGreaterThan(ingredients!.y);
				await expect(page.getByRole('button', { name: 'Save recipe', exact: true }).locator('..')).toHaveCSS('position', 'static');
			}
			const overflow = await page.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(node => {
				const rect = node.getBoundingClientRect();
				return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
			}).map(node => node.tagName));
			expect(overflow).toEqual([]);
			if (name === 'desktop' || name === 'mobile') {
				await mkdir('output/playwright/recipe-import', { recursive: true });
				await page.screenshot({ path: `output/playwright/recipe-import/${name}-${state}.png`, fullPage: true });
			}
		}
	});
}
