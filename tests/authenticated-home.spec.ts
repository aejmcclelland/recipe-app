import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

// Follow the existing recipe-sharing browser-fixture pattern. The real async
// home page, theme selector, shell and interactive components are bundled with
// isolated server doubles; credentials and the database are never used.
const require = createRequire(import.meta.url);
const { build } = require(require.resolve('esbuild', { paths: [require.resolve('tsx')] })) as {
	build(options: Record<string, unknown>): Promise<{ outputFiles: { text: string }[] }>;
};
const fixture = JSON.stringify(path.resolve('tests/fixtures/authenticated-home.tsx'));
const shims: Record<string, string> = {
	'@/config/database': 'export default async function connectDB() {}',
	'../models/Recipe': `import {data} from ${fixture}; export default {find: () => {const query = {populate: () => query, lean: async () => data().recipes}; return query;}};`,
	'@/models/Category': `import {data} from ${fixture}; export default {find: () => ({lean: async () => data().categories})};`,
	'@/utils/getSessionUser': `import {data} from ${fixture}; export async function getSessionUser() {return data().user;}`,
	'@/utils/recipeAccess': `import {data} from ${fixture}; export async function getSharedRecipesForViewer() {return data().shared;}`,
	'@/app/actions/bookmarkRecipe': `export {bookmark as default} from ${fixture};`,
	'next/headers': "export async function headers() {return new Headers({'x-url': location.href});}",
	'next/navigation': `export {useRouter, usePathname} from ${fixture}; export function useServerInsertedHTML() {}`,
	'next/link': `export {FixtureLink as default} from ${fixture};`,
	'next/image': "export {Image as default} from 'next/dist/client/image-component';",
	'next/font/google': `export function Archivo() {return {style: {fontFamily: document.documentElement.dataset.bodyFont}};} export function Shadows_Into_Light() {return {style: {fontFamily: document.documentElement.dataset.wordmarkFont}};}`,
};
let bundle: string;
let browserErrors: string[];

test.beforeAll(async () => {
	const result = await build({
		entryPoints: ['tests/fixtures/authenticated-home.tsx'],
		bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
		loader: { '.js': 'jsx', '.jsx': 'jsx' },
		define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}' },
		plugins: [{
			name: 'home-fixture-boundaries',
			setup(builder: {
				onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
				onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: 'js'; resolveDir: string }): void;
			}) {
				builder.onResolve({ filter: /.*/ }, args => shims[args.path] ? { path: args.path, namespace: 'home-shim' } : undefined);
				builder.onLoad({ filter: /.*/, namespace: 'home-shim' }, args => ({ contents: shims[args.path], loader: 'js', resolveDir: process.cwd() }));
			},
		}],
	});
	bundle = result.outputFiles[0].text;
});

test.beforeEach(async ({ page }) => {
	browserErrors = [];
	page.on('pageerror', error => browserErrors.push(error.message));
	// Reuse the installed Next/font output and global styles from the real app.
	await page.goto('/');
	await expect(page.locator('.site-appbar img')).toBeVisible();
	const appearance = await page.evaluate(() => ({
		styles: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(link => link.outerHTML).join(''),
		bodyFont: getComputedStyle(document.body).fontFamily,
		wordmarkFont: getComputedStyle(document.querySelector('.site-appbar a .MuiTypography-root:last-child')!).fontFamily,
	}));
	await page.route('**/__home-fixture.js', route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
	await page.route(url => url.pathname === '/', route => route.fulfill({
		contentType: 'text/html',
		body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Authenticated home review fixture</title>${appearance.styles}</head><body><div id="root"></div><script>document.documentElement.dataset.bodyFont=${JSON.stringify(appearance.bodyFont)};document.documentElement.dataset.wordmarkFont=${JSON.stringify(appearance.wordmarkFont)};</script><script src="/__home-fixture.js"></script></body></html>`,
	}));
});

test.afterEach(() => expect(browserErrors).toEqual([]));

test('owned/shared collections, category selection and bookmark state remain functional', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'Hello, Rebekah!' })).toBeVisible();
	await expect(page.getByTestId('home-recipe-card')).toHaveCount(3);
	await expect(page.getByTestId('home-recipe-card').first()).toHaveCSS('box-shadow', 'none');
	await expect(page.getByRole('button', { name: 'Remove Bookmark' })).toHaveCount(1);
	await page.getByRole('button', { name: 'Soup', exact: true }).click();
	await expect(page.getByTestId('home-recipe-card')).toHaveCount(0);
	await expect(page.getByText('No recipes found for this category.', { exact: true })).toBeVisible();
	await expect(page.getByText('No shared recipes found for this category.', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'All', exact: true }).click();
	await expect(page.getByTestId('home-recipe-card')).toHaveCount(3);
	await expect(page.getByRole('button', { name: 'Remove Bookmark' })).toHaveCount(1);
});

test('bookmark stays optimistic, guards duplicate saves and rolls back failed requests', async ({ page }) => {
	await page.goto('/');
	const card = page.getByTestId('home-recipe-card').first();
	await card.getByRole('button', { name: 'Add Bookmark' }).click();
	await expect(card.getByRole('button', { name: 'Remove Bookmark' })).toHaveAttribute('aria-pressed', 'true');
	await card.getByRole('button', { name: 'Remove Bookmark' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-bookmark-calls', '1');
	await page.evaluate(() => window.dispatchEvent(new Event('fixture-bookmark-complete')));
	await expect(page.getByText(/added to your bookmarks/)).toBeVisible();
	for (const result of ['failure', 'throw']) {
		await page.evaluate(value => { document.documentElement.dataset.bookmarkResult = value; }, result);
		await card.getByRole('button', { name: 'Remove Bookmark' }).click();
		await expect(card.getByRole('button', { name: 'Add Bookmark' })).toHaveAttribute('aria-pressed', 'false');
		await page.evaluate(() => window.dispatchEvent(new Event('fixture-bookmark-complete')));
		await expect(card.getByRole('button', { name: 'Remove Bookmark' })).toHaveAttribute('aria-pressed', 'true');
	}
});

test('search preserves its URL and switches back to the legacy route theme', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('textbox', { name: 'search', exact: true }).fill('pasta soup');
	await page.getByRole('button', { name: 'Search recipes', exact: true }).click();
	await expect(page).toHaveURL(/\/recipes\/search-results\?searchQuery=pasta%20soup$/);
	await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
	await expect(page.locator('.site-appbar').getByTestId('RestaurantOutlinedIcon')).toBeVisible();
	await expect(page.locator('.MuiCard-root')).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.2) 2px 4px 20px 0px');
	await expect(page.getByRole('button', { name: 'Legacy action' })).toHaveCSS('width', '64px');
	await page.locator('.site-appbar a[href="/"]').click();
	await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
	await expect(page.getByRole('button', { name: 'Search recipes', exact: true })).toBeVisible();
});

for (const scenario of ['empty', 'shared-only', 'owned-only']) {
	test(`${scenario} retains the expected collections and add/import actions`, async ({ page }) => {
		await page.goto(`/?scenario=${scenario}&page=new`);
		if (scenario === 'owned-only') {
			await expect(page.getByRole('region', { name: 'Shared with me' })).toHaveCount(0);
			await expect(page.getByTestId('home-recipe-card')).toHaveCount(2);
		} else {
			await expect(page.locator('main').getByRole('link', { name: 'Get a Recipe', exact: true })).toHaveAttribute('href', '/recipes/copyWeb');
			await expect(page.locator('main').getByRole('link', { name: 'Add a Recipe', exact: true })).toHaveAttribute('href', '/recipes/add');
			await expect(page.getByTestId('home-recipe-card')).toHaveCount(scenario === 'empty' ? 0 : 1);
		}
		if (scenario === 'empty') await expect(page.getByText('Let’s get started by adding or importing your first recipe.')).toBeVisible();
		if (scenario === 'shared-only') await expect(page.getByText('You have not added any recipes of your own yet.')).toBeVisible();
	});
}

for (const [name, width] of [['desktop', 1440], ['mobile', 390]] as const) {
	test(`${name} home preserves responsive layout and captures the first pass`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		await expect(page.getByTestId('home-recipe-card')).toHaveCount(3);
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('main img')].every(image => image.complete && image.naturalWidth > 0));
		await expect(page.locator('.site-appbar img')).toHaveAttribute('src', /logo-face/);
		await expect(page.locator('.site-appbar').getByTestId('AddCircleIcon')).toBeVisible();
		await expect(page.locator('.site-appbar').getByTestId('LanguageIcon')).toBeVisible();
		const cards = await page.getByTestId('home-recipe-card').evaluateAll(nodes => nodes.map(node => ({ x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y })));
		if (name === 'mobile') expect(cards[1].y).toBeGreaterThan(cards[0].y);
		else expect(cards[1].y).toBe(cards[0].y);
		const filter = page.getByRole('button', { name: 'All', exact: true }).locator('..');
		await expect(filter).toHaveCSS('overflow-x', 'auto');
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
		await mkdir('output/playwright/phase-2a', { recursive: true });
		await page.screenshot({ path: `output/playwright/phase-2a/authenticated-home-${name}.png`, fullPage: true });
	});
}
