import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

// Use the existing authenticated-home fixture pattern to exercise the actual
// detail page and shared controls without database writes or a real account.
const require = createRequire(import.meta.url);
const { build } = require(require.resolve('esbuild', { paths: [require.resolve('tsx')] })) as {
	build(options: Record<string, unknown>): Promise<{ outputFiles: { text: string }[] }>;
};
const detailPath = '/recipes/cccccccccccccccccccccccc';
const fixture = JSON.stringify(path.resolve('tests/fixtures/recipe-detail.tsx'));
const shims: Record<string, string> = {
	'@/utils/getSessionUser': `import {data} from ${fixture}; export async function getSessionUser() {return data().user;}`,
	'@/utils/recipeAccess': `import {data} from ${fixture}; export async function getRecipeForViewer() {return data().recipe;}`,
	'@/app/actions/bookmarkRecipe': `export {bookmark as default} from ${fixture};`,
	'@/app/actions/deleteRecipe': `export {deleteRecipe as default} from ${fixture};`,
	'@/app/actions/recipeSharing': `export * from ${JSON.stringify(path.resolve('tests/fixtures/recipe-sharing-actions.ts'))};`,
	'next/navigation': `export {useRouter, usePathname} from ${fixture}; export function useServerInsertedHTML() {}`,
	'next/link': `export {FixtureLink as default} from ${fixture};`,
	'next/image': "export {Image as default} from 'next/dist/client/image-component';",
	'next/font/google': `export function Archivo() {return {style: {fontFamily: document.documentElement.dataset.bodyFont}};} export function Shadows_Into_Light() {return {style: {fontFamily: document.documentElement.dataset.wordmarkFont}};}`,
};
let bundle: string;
let browserErrors: string[];
test.beforeAll(async () => {
	const result = await build({
		entryPoints: ['tests/fixtures/recipe-detail.tsx'],
		bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
		loader: { '.js': 'jsx', '.jsx': 'jsx' },
		define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}' },
		plugins: [{
			name: 'detail-fixture-boundaries',
			setup(builder: {
				onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
				onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: 'js'; resolveDir: string }): void;
			}) {
				builder.onResolve({ filter: /.*/ }, args => shims[args.path] ? { path: args.path, namespace: 'detail-shim' } : undefined);
				builder.onLoad({ filter: /.*/, namespace: 'detail-shim' }, args => ({ contents: shims[args.path], loader: 'js', resolveDir: process.cwd() }));
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
	await page.route('**/__detail-fixture.js', route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
	await page.route(url => url.pathname === detailPath, route => route.fulfill({
		contentType: 'text/html',
		body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Recipe detail review fixture</title>${appearance.styles}</head><body><div id="root"></div><script>document.documentElement.dataset.bodyFont=${JSON.stringify(appearance.bodyFont)};document.documentElement.dataset.wordmarkFont=${JSON.stringify(appearance.wordmarkFont)};</script><script src="/__detail-fixture.js"></script></body></html>`,
	}));
});
test.afterEach(() => expect(browserErrors).toEqual([]));

test('owner content, formatting and action hierarchy are preserved', async ({ page }) => {
	await page.goto(detailPath, { waitUntil: 'domcontentloaded' });
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Weeknight pesto pasta');
	await expect(page.locator('article')).toHaveCSS('box-shadow', 'none');
	await expect(page.getByRole('region', { name: 'Ingredients:' }).locator('li')).toHaveText([
		'200 g pasta', '1½ tablespoons olive oil', '¼ teaspoon sea salt',
		'A handful of fresh basil', '2 garlic cloves, finely chopped', '½ cup grated parmesan',
	]);
	await expect(page.getByRole('region', { name: 'Steps:' }).locator('li')).toHaveCount(5);
	await expect(page.getByRole('region', { name: 'Steps:' }).locator('li').last()).toHaveText('Serve immediately with extra parmesan at the table.');
	for (const text of ['Prep Time: 10 minutes', 'Cook Time: 15 minutes', 'Serves: 2']) await expect(page.getByText(text, { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Edit Recipe', exact: true })).toHaveClass(/MuiButton-outlined/);
	await expect(page.getByRole('button', { name: 'Delete Recipe', exact: true })).toHaveClass(/MuiButton-textError/);
	await expect(page.getByRole('button', { name: 'Back to Home', exact: true })).toHaveClass(/MuiButton-text/);
	await expect(page.getByRole('button', { name: 'Manage sharing', exact: true })).toHaveClass(/MuiButton-outlined/);
});

test('shared recipient retains recipe content and no owner action row', async ({ page }) => {
	await page.goto(`${detailPath}?scenario=shared`);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	for (const name of ['Add Bookmark', 'Manage sharing', 'Edit Recipe', 'Delete Recipe', 'Back to Home']) {
		await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0);
	}
});

test('empty ingredients and method retain their existing messages', async ({ page }) => {
	await page.goto(`${detailPath}?scenario=empty`);
	await expect(page.getByText('No Ingredients Found', { exact: true })).toBeVisible();
	await expect(page.getByText('No steps provided', { exact: true })).toBeVisible();
});

test('bookmark remains optimistic, guards duplicate saves and rolls back failures', async ({ page }) => {
	await page.goto(detailPath);
	await page.getByRole('button', { name: 'Add Bookmark', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Remove Bookmark', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { name: 'Remove Bookmark', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-bookmark-calls', '1');
	await page.evaluate(() => window.dispatchEvent(new Event('fixture-bookmark-complete')));
	await expect(page.getByText(/added to your bookmarks/)).toBeVisible();
	for (const result of ['failure', 'throw']) {
		await page.evaluate(value => { document.documentElement.dataset.bookmarkResult = value; }, result);
		await page.getByRole('button', { name: 'Remove Bookmark', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Add Bookmark', exact: true })).toHaveAttribute('aria-pressed', 'false');
		await page.evaluate(() => window.dispatchEvent(new Event('fixture-bookmark-complete')));
		await expect(page.getByRole('button', { name: 'Remove Bookmark', exact: true })).toHaveAttribute('aria-pressed', 'true');
	}
});

test('home/edit navigation and delete confirmation retain their behaviour', async ({ page }) => {
	await page.goto(detailPath);
	await page.getByRole('button', { name: 'Edit Recipe', exact: true }).click();
	await expect(page).toHaveURL(`${detailPath}/edit`);
	await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
	await page.goto(detailPath);
	await page.getByRole('button', { name: 'Back to Home', exact: true }).click();
	await expect(page).toHaveURL('/');
	await page.goto(detailPath);
	page.once('dialog', async dialog => {
		expect(dialog.message()).toBe('Are you sure you want to delete this recipe?');
		await dialog.dismiss();
	});
	await page.getByRole('button', { name: 'Delete Recipe', exact: true }).click();
	await expect(page).toHaveURL(detailPath);
	expect(await page.locator('html').getAttribute('data-delete-calls')).toBeNull();
	page.once('dialog', dialog => dialog.accept());
	await page.getByRole('button', { name: 'Delete Recipe', exact: true }).click();
	await expect(page).toHaveURL('/');
	await expect(page.locator('html')).toHaveAttribute('data-delete-calls', '1');
});

test('sharing dialog works under the detail theme and restores focus', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(detailPath);
	const trigger = page.getByRole('button', { name: 'Manage sharing', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Manage sharing' });
	const input = dialog.getByRole('textbox', { name: 'Recipient email' });
	await input.fill('recipient@example.com');
	await dialog.getByRole('button', { name: 'Find recipient' }).click();
	await dialog.getByRole('button', { name: 'Share recipe', exact: true }).click();
	await expect(dialog.getByRole('status')).toHaveText('Recipe shared successfully.');
	await dialog.getByRole('button', { name: 'Revoke access for recipient@example.com' }).click();
	await expect(dialog.getByText('This recipe is not shared with anyone.')).toBeVisible();
	const bounds = await dialog.boundingBox();
	expect(bounds!.x).toBeGreaterThanOrEqual(0);
	expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(trigger).toBeFocused();
});

for (const [name, width] of [['desktop', 1440], ['mobile', 390], ['tablet', 1023], ['desktop-breakpoint', 1024]] as const) {
	test(`${name} retains the detail layout without horizontal overflow`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(detailPath);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('main img')].every(image => image.complete && image.naturalWidth > 0));
		const ingredients = await page.getByRole('region', { name: 'Ingredients:' }).boundingBox();
		const method = await page.getByRole('region', { name: 'Steps:' }).boundingBox();
		if (width < 1024) expect(method!.y).toBeGreaterThan(ingredients!.y + ingredients!.height);
		else expect(method!.x).toBeGreaterThan(ingredients!.x + ingredients!.width);
		const overflow = await page.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(node => {
			const rect = node.getBoundingClientRect();
			return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
		}).map(node => node.tagName));
		expect(overflow).toEqual([]);
		await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
		await expect(page.locator('.site-appbar img')).toHaveAttribute('src', /logo-face/);
		await expect(page.getByRole('button', { name: 'Add Bookmark', exact: true })).toHaveCSS('width', '44px');
		if (name === 'desktop' || name === 'mobile') {
			await mkdir('output/playwright/recipe-detail', { recursive: true });
			await page.screenshot({ path: `output/playwright/recipe-detail/recipe-detail-${name}.png`, fullPage: true });
		}
	});
}
