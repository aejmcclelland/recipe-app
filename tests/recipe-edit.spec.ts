import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

// Render the actual edit route and shell with isolated data/action boundaries.
// No real scraping or recipe writes take place.
const require = createRequire(import.meta.url);
const { build } = require(require.resolve('esbuild', { paths: [require.resolve('tsx')] })) as {
	build(options: Record<string, unknown>): Promise<{ outputFiles: { text: string }[] }>;
};
const editPath = '/recipes/cccccccccccccccccccccccc/edit';
const fixture = JSON.stringify(path.resolve('tests/fixtures/recipe-edit.tsx'));
const shims: Record<string, string> = {
	// The browser fixture only needs this route-ID predicate; access tests use real Mongoose.
	'mongoose': 'export default { Types: { ObjectId: { isValid: value => /^[a-f0-9]{24}$/i.test(value) } } };',
	'@/config/database': `export {connectDB as default} from ${fixture};`,
	'@/models/Recipe': `export {recipeModel as default} from ${fixture};`,
	'@/models/Category': `export {categoryModel as default} from ${fixture};`,
	'@/utils/getSessionUser': `export {getSessionUser} from ${fixture};`,
	'@/app/actions/editRecipe': `export {updateRecipe as default} from ${fixture};`,
	'@/app/actions/deleteRecipe': `export {deleteRecipe as default} from ${fixture};`,
	'next/navigation': `export {useRouter, usePathname} from ${fixture}; export function useServerInsertedHTML() {}`,
	'next/link': `export {FixtureLink as default} from ${fixture};`,
	'next/image': "export {Image as default} from 'next/dist/client/image-component';",
	'next/font/google': `export function Archivo() {return {style: {fontFamily: document.documentElement.dataset.bodyFont}};} export function Shadows_Into_Light() {return {style: {fontFamily: document.documentElement.dataset.wordmarkFont}};}`,
};
let bundle: string;
let browserErrors: string[];
test.beforeAll(async () => {
	const result = await build({
		entryPoints: ['tests/fixtures/recipe-edit.tsx'],
		bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
		loader: { '.js': 'jsx', '.jsx': 'jsx' },
		// Next's test mode skips its development-only remote-host matcher in this browser bundle.
		define: { 'process.env.NODE_ENV': '"test"', 'process.env': '{}' },
		plugins: [{
			name: 'edit-fixture-boundaries',
			setup(builder: {
				onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
				onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: 'js'; resolveDir: string }): void;
			}) {
				builder.onResolve({ filter: /.*/ }, args => shims[args.path] ? { path: args.path, namespace: 'edit-shim' } : undefined);
				builder.onLoad({ filter: /.*/, namespace: 'edit-shim' }, args => ({ contents: shims[args.path], loader: 'js', resolveDir: process.cwd() }));
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
	await page.route('**/__edit-fixture.js', route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
	await page.route(url => url.pathname === editPath, route => route.fulfill({
		contentType: 'text/html',
		body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Edit review fixture</title>${appearance.styles}</head><body><div id="root"></div><script>document.documentElement.dataset.bodyFont=${JSON.stringify(appearance.bodyFont)};document.documentElement.dataset.wordmarkFont=${JSON.stringify(appearance.wordmarkFont)};</script><script src="/__edit-fixture.js"></script></body></html>`,
	}));
});
test.afterEach(() => expect(browserErrors).toEqual([]));
const updateButton = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Update Recipe', exact: true });
async function complete(page: import('@playwright/test').Page, action = 'update') {
	await page.evaluate(name => window.dispatchEvent(new Event(`fixture-${name}-complete`)), action);
}
async function payload(page: import('@playwright/test').Page) {
	await expect(page.locator('html')).toHaveAttribute('data-update-data');
	return JSON.parse((await page.locator('html').getAttribute('data-update-data'))!) as Record<string, string | { name: string; size: number }>;
}

test('fields, category, image and action hierarchy retain their data', async ({ page }) => {
	await page.goto(editPath);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit Recipe');
	await expect(page.getByRole('textbox', { name: /Recipe Name/ })).toHaveValue('Weeknight pesto pasta');
	await expect(page.getByRole('combobox', { name: /Category/ })).toHaveText('Pasta');
	await expect(page.getByRole('spinbutton', { name: /Prep Time/ })).toHaveValue('10');
	await expect(page.getByRole('spinbutton', { name: /Cook Time/ })).toHaveValue('15');
	await expect(page.getByRole('spinbutton', { name: /Serves/ })).toHaveValue('2');
	await expect(page.getByRole('textbox', { name: 'Step 1', exact: true })).toHaveJSProperty('tagName', 'INPUT');
	await expect(updateButton(page)).toHaveCSS('background-color', 'rgb(26, 32, 39)');
	await expect(page.getByRole('button', { name: '+ Add Ingredient', exact: true })).toHaveClass(/MuiButton-outlinedPrimary/);
	await expect(page.getByRole('button', { name: '+ Add Step', exact: true })).toHaveClass(/MuiButton-outlinedPrimary/);
	await expect(page.getByRole('button', { name: 'Delete Recipe', exact: true })).toHaveClass(/MuiButton-outlinedError/);
	const fields = await page.locator('form').evaluate(form => [...form.querySelectorAll('input, textarea')].map(input => input.getAttribute('name')));
	expect(fields.slice(0, 2)).toEqual(['name', 'category']);
});

test('update keeps the FormData shape, fraction conversion, feedback and navigation', async ({ page }) => {
	await page.goto(editPath);
	await page.getByRole('textbox', { name: /Recipe Name/ }).fill('Updated pasta');
	await page.getByRole('textbox', { name: 'Quantity', exact: true }).first().fill('1/2');
	await page.getByRole('textbox', { name: 'Step 1', exact: true }).fill('  Cook the pasta.  ');
	await page.getByRole('combobox', { name: /Category/ }).click();
	await page.getByRole('option', { name: 'Dinner', exact: true }).click();
	await page.evaluate(() => { document.documentElement.dataset.updateFailure = 'yes'; });
	await updateButton(page).click();
	await expect(updateButton(page)).toBeEnabled(); // Existing submission semantics: no new pending guard.
	const data = await payload(page);
	expect(Object.keys(data).sort()).toEqual(['name', 'category', 'imageFile', 'prepTime', 'cookTime', 'serves', 'ingredients', 'steps', 'deleteImage'].sort());
	expect(data.name).toBe('Updated pasta'); expect(data.category).toBe('dinner');
	expect(data.prepTime).toBe('10'); expect(data.cookTime).toBe('15'); expect(data.serves).toBe('2');
	expect(data.deleteImage).toBe('false');
	expect(JSON.parse(String(data.ingredients))[0]).toMatchObject({ ingredient: 'pasta', quantity: 0.5, unit: 'g' });
	expect(JSON.parse(String(data.ingredients))[0]).not.toHaveProperty('rowId');
	expect(JSON.parse(String(data.steps))[0]).toBe('Cook the pasta.');
	await complete(page);
	await expect(page.getByText('Error updating recipe!', { exact: true })).toBeVisible();
	await expect(page.getByRole('textbox', { name: /Recipe Name/ })).toHaveValue('Updated pasta');
	await page.evaluate(() => { delete document.documentElement.dataset.updateFailure; });
	await updateButton(page).click();
	await complete(page);
	await expect(page).toHaveURL('/recipes/cccccccccccccccccccccccc');
	await expect(page.getByText('Recipe updated successfully!', { exact: true })).toBeVisible();
});

test('ingredient validation still blocks submission and clears edited field errors', async ({ page }) => {
	await page.goto(editPath);
	await page.getByRole('textbox', { name: 'Quantity', exact: true }).first().fill('');
	await updateButton(page).click();
	await expect(page.getByText('Please enter a quantity.', { exact: true })).toBeVisible();
	await expect(page.getByText('Please fix the highlighted ingredient fields.', { exact: true })).toBeVisible();
	await expect(page.locator('html')).not.toHaveAttribute('data-update-data');
	await page.getByRole('textbox', { name: 'Quantity', exact: true }).first().fill('200');
	await expect(page.getByText('Please enter a quantity.', { exact: true })).toHaveCount(0);
	for (const input of await page.getByRole('textbox', { name: /^Step [0-9]+$/ }).all()) await input.fill('');
	await updateButton(page).click();
	await expect(page.getByText('Please add at least one step.', { exact: true })).toBeVisible();
	await expect(page.locator('html')).not.toHaveAttribute('data-update-data');
});

test('row editing/removal retains values and unknown units retain their custom-unit handling', async ({ page }) => {
	await page.goto(`${editPath}?scenario=custom-unit`);
	await expect(page.getByRole('textbox', { name: 'Custom unit', exact: true })).toHaveValue('handful');
	await page.getByRole('textbox', { name: 'Ingredient', exact: true }).nth(1).fill('Edited olive oil');
	await page.getByRole('button', { name: 'Remove ingredient', exact: true }).first().click();
	await expect(page.getByRole('textbox', { name: 'Ingredient', exact: true }).first()).toHaveValue('Edited olive oil');
	await page.getByRole('button', { name: '+ Add Ingredient', exact: true }).click();
	await expect(page.getByRole('textbox', { name: 'Ingredient', exact: true })).toHaveCount(3);
	await page.getByRole('textbox', { name: 'Step 2', exact: true }).fill('Edited method');
	await page.getByRole('button', { name: 'Remove step', exact: true }).first().click();
	await expect(page.getByRole('textbox', { name: 'Step 1', exact: true })).toHaveValue('Edited method');
	await page.getByRole('button', { name: '+ Add Step', exact: true }).click();
	await expect(page.getByRole('textbox', { name: 'Step 3', exact: true })).toHaveValue('');
});

test('image selection/removal retains the existing preview and payload semantics', async ({ page }) => {
	await page.goto(editPath);
	const image = page.getByRole('img', { name: 'Weeknight pesto pasta', exact: true });
	const initial = await image.getAttribute('src');
	const file = page.locator('form input[type=file]');
	await file.setInputFiles(path.resolve('public/images/branding/logo-face.png'));
	await expect(page.getByText('Selected: logo-face.png', { exact: true })).toBeVisible();
	await expect(image).toHaveAttribute('src', initial!);
	await updateButton(page).click();
	let data = await payload(page);
	expect(data.imageFile).toMatchObject({ name: 'logo-face.png' }); expect(data.deleteImage).toBe('false');
	await page.evaluate(() => { document.documentElement.dataset.updateFailure = 'yes'; });
	await complete(page);
	await expect(page.getByText('Error updating recipe!', { exact: true })).toBeVisible();
	await page.getByRole('checkbox', { name: 'Delete current image and use default image' }).check();
	await expect(page.getByText('Selected: logo-face.png', { exact: true })).toHaveCount(0);
	await expect(image).toHaveAttribute('src', /300_bebabf/);
	await updateButton(page).click();
	data = await payload(page); expect(data.deleteImage).toBe('true');
	await complete(page);
	// Choose a different file: selecting the same file does not fire a native change event.
	await file.setInputFiles(path.resolve('public/images/landing/hero-pasta.jpg'));
	await expect(page.getByRole('checkbox', { name: 'Delete current image and use default image' })).not.toBeChecked();
});

test('back navigation and delete confirmation, pending, retry and home navigation remain intact', async ({ page }) => {
	await page.goto(editPath);
	await expect(page.getByRole('link', { name: 'Back to recipe', exact: true })).toHaveAttribute('href', '/recipes/cccccccccccccccccccccccc');
	await page.getByRole('link', { name: 'Back to recipe', exact: true }).click();
	await expect(page).toHaveURL('/recipes/cccccccccccccccccccccccc');
	await page.goto(editPath);
	const button = page.getByRole('button', { name: 'Delete Recipe', exact: true });
	page.once('dialog', dialog => { expect(dialog.message()).toBe('Are you sure you want to delete this recipe?'); return dialog.dismiss(); });
	await button.click(); await expect(page.locator('html')).not.toHaveAttribute('data-delete-id');
	await page.evaluate(() => { document.documentElement.dataset.deleteFailure = 'yes'; });
	page.once('dialog', dialog => dialog.accept()); await button.click();
	await expect(page.getByRole('button', { name: 'Deleting...', exact: true })).toBeDisabled();
	await complete(page, 'delete'); await expect(button).toBeEnabled();
	await page.evaluate(() => { delete document.documentElement.dataset.deleteFailure; });
	page.once('dialog', dialog => dialog.accept()); await button.click(); await complete(page, 'delete');
	await expect(page).toHaveURL('/');
});

for (const [name, width] of [['desktop', 1440], ['mobile', 390], ['small-mobile', 320], ['tablet', 640]] as const) {
	test(`${name} layout preserves usable inputs without overflow`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 }); await page.goto(editPath);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit Recipe');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction(() => Array.from(document.images).every(image => image.complete && image.naturalWidth > 0));
		await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
		await expect(page.locator('.site-appbar img').first()).toHaveAttribute('src', /logo-face/);
		await expect(page.getByRole('textbox', { name: /Recipe Name/ })).toHaveCSS('padding-left', '14px');
		const overflow = await page.locator('main').evaluate(main => [...main.querySelectorAll('*')].filter(node => {
			// Hidden file inputs and MUI textarea measurement mirrors have no visible content.
			if (node instanceof HTMLInputElement && node.type === 'file' || node.getAttribute('aria-hidden') === 'true') return false;
			const rect = node.getBoundingClientRect(); return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
		}).map(node => node.tagName));
		expect(overflow).toEqual([]);
		const prep = await page.getByRole('spinbutton', { name: /Prep Time/ }).boundingBox();
		const cook = await page.getByRole('spinbutton', { name: /Cook Time/ }).boundingBox();
		if (width < 640) expect(cook!.y).toBeGreaterThan(prep!.y); else expect(cook!.y).toBe(prep!.y);
		await page.getByRole('combobox', { name: /Category/ }).click();
		await expect(page.getByRole('option', { name: 'Dinner', exact: true })).toBeVisible();
		await page.keyboard.press('Escape'); await expect(page.locator('.MuiPopover-root')).toHaveCount(0);
		if (name === 'desktop' || name === 'mobile') {
			await mkdir('output/playwright/recipe-edit', { recursive: true });
			await page.screenshot({ path: `output/playwright/recipe-edit/${name}.png`, fullPage: true });
		}
	});
}
