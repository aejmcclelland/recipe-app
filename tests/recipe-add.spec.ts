import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { collectBrowserErrors } from './helpers/browserErrors';

// Render the actual Add route and shell with isolated data/action boundaries.
// No real scraping or recipe writes take place.
const require = createRequire(import.meta.url);
const { build } = require(
	require.resolve('esbuild', { paths: [require.resolve('tsx')] }),
) as {
	build(
		options: Record<string, unknown>,
	): Promise<{ outputFiles: { text: string }[] }>;
};
const addPath = '/recipes/add';
const fixture = JSON.stringify(path.resolve('tests/fixtures/recipe-add.tsx'));
const shims: Record<string, string> = {
	'@/app/actions/getCategories': `export {getCategories} from ${fixture};`,
	'@/app/actions/addRecipe': `export {addRecipe as default} from ${fixture};`,
	'next/navigation': `export {useRouter, usePathname} from ${fixture}; export function useServerInsertedHTML() {}`,
	'next/link': `export {FixtureLink as default} from ${fixture};`,
	'next/image':
		"export {Image as default} from 'next/dist/client/image-component';",
	'next/font/google': `export function Archivo() {return {style: {fontFamily: document.documentElement.dataset.bodyFont}};} export function Shadows_Into_Light() {return {style: {fontFamily: document.documentElement.dataset.wordmarkFont}};}`,
};
let bundle: string;
let browserErrors: string[];
test.beforeAll(async () => {
	const result = await build({
		entryPoints: ['tests/fixtures/recipe-add.tsx'],
		bundle: true,
		write: false,
		platform: 'browser',
		format: 'iife',
		jsx: 'automatic',
		loader: { '.js': 'jsx', '.jsx': 'jsx' },
		// Next's test mode skips its development-only remote-host matcher in this browser bundle.
		define: { 'process.env.NODE_ENV': '"test"', 'process.env': '{}' },
		plugins: [
			{
				name: 'add-fixture-boundaries',
				setup(builder: {
					onResolve(
						options: { filter: RegExp },
						callback: (args: {
							path: string;
						}) => { path: string; namespace: string } | undefined,
					): void;
					onLoad(
						options: { filter: RegExp; namespace: string },
						callback: (args: { path: string }) => {
							contents: string;
							loader: 'js';
							resolveDir: string;
						},
					): void;
				}) {
					builder.onResolve({ filter: /.*/ }, (args) =>
						shims[args.path]
							? { path: args.path, namespace: 'add-shim' }
							: undefined,
					);
					builder.onLoad({ filter: /.*/, namespace: 'add-shim' }, (args) => ({
						contents: shims[args.path],
						loader: 'js',
						resolveDir: process.cwd(),
					}));
				},
			},
		],
	});
	bundle = result.outputFiles[0].text;
});
test.beforeEach(async ({ page }) => {
	browserErrors = [];
	collectBrowserErrors(page, browserErrors);
	await page.goto('/');
	await expect(page.locator('.site-appbar img')).toBeVisible();
	const appearance = await page.evaluate(() => ({
		styles: [
			...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
		]
			.map((link) => link.outerHTML)
			.join(''),
		bodyFont: getComputedStyle(document.body).fontFamily,
		wordmarkFont: getComputedStyle(
			document.querySelector('.site-appbar a .MuiTypography-root:last-child')!,
		).fontFamily,
	}));
	await page.route('**/api/auth/**', async (route) => {
		const url = new URL(route.request().url());
		if (url.pathname.endsWith('/csrf'))
			return route.fulfill({ json: { csrfToken: 'fixture-token' } });
		const body =
			route.request().method() === 'POST'
				? route.request().postDataJSON()
				: null;
		if (body?.data)
			await page.evaluate((data) => {
				document.documentElement.dataset.sessionUpdate = JSON.stringify(data);
			}, body.data);
		return route.fulfill({
			json: body?.data ?? {
				user: {
					id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
					name: 'Rebekah Tester',
					email: 'rebekah@example.test',
					image: null,
				},
				expires: '2099-01-01T00:00:00.000Z',
			},
		});
	});
	await page.route('**/__add-fixture.js', (route) =>
		route.fulfill({ contentType: 'text/javascript', body: bundle }),
	);
	await page.route(
		(url) => url.pathname === addPath,
		(route) =>
			route.fulfill({
				contentType: 'text/html',
				body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Add review fixture</title>${appearance.styles}</head><body><div id="root"></div><script>document.documentElement.dataset.bodyFont=${JSON.stringify(appearance.bodyFont)};document.documentElement.dataset.wordmarkFont=${JSON.stringify(appearance.wordmarkFont)};</script><script src="/__add-fixture.js"></script></body></html>`,
			}),
	);
});
test.afterEach(() => expect(browserErrors).toEqual([]));
const createButton = (page: import('@playwright/test').Page) =>
	page.getByRole('button', { name: 'Create Recipe', exact: true });
async function fillBasics(page: import('@playwright/test').Page) {
	await page.getByRole('textbox', { name: /Recipe Name/ }).fill('Family pasta');
	await page.getByRole('combobox', { name: /Category/ }).click();
	await page.getByRole('option', { name: 'Pasta', exact: true }).click();
	await page.getByRole('spinbutton', { name: /Prep Time/ }).fill('10');
	await page.getByRole('spinbutton', { name: /Cook Time/ }).fill('15');
	await page.getByRole('spinbutton', { name: /Serves/ }).fill('2');
}
async function fillRows(page: import('@playwright/test').Page) {
	await page
		.getByRole('button', { name: '+ Add Ingredient', exact: true })
		.click();
	await page
		.getByRole('textbox', { name: 'Ingredient', exact: true })
		.fill('pasta');
	await page
		.getByRole('textbox', { name: 'Quantity', exact: true })
		.fill('200');
	await page.getByRole('combobox', { name: /^Unit/ }).click();
	await page.getByRole('option', { name: 'g', exact: true }).click();
	await page.getByRole('button', { name: '+ Add Step', exact: true }).click();
	await page
		.getByRole('textbox', { name: 'Step 1', exact: true })
		.fill('Cook the pasta in salted water.');
}
async function submitted(page: import('@playwright/test').Page) {
	await expect(page.locator('html')).toHaveAttribute('data-add-data');
	return JSON.parse(
		(await page.locator('html').getAttribute('data-add-data'))!,
	) as Record<string, string | { name: string; size: number }>;
}

test('initial hierarchy, required fields, empty rows and quiet actions', async ({
	page,
}) => {
	await page.goto(addPath);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Add a Recipe',
	);
	await expect(page.getByRole('textbox', { name: /Recipe Name/ })).toHaveValue(
		'',
	);
	await expect(
		page.getByRole('textbox', { name: /Recipe Name/ }),
	).toHaveAttribute('required');
	await expect(
		page.getByRole('textbox', { name: 'Ingredient', exact: true }),
	).toHaveCount(0);
	await expect(page.getByRole('textbox', { name: /^Step / })).toHaveCount(0);
	await expect(createButton(page)).toHaveCSS(
		'background-color',
		'rgb(26, 32, 39)',
	);
	await expect(
		page.getByRole('button', { name: '+ Add Ingredient', exact: true }),
	).toHaveClass(/MuiButton-outlinedPrimary/);
	await expect(
		page.getByRole('button', { name: '+ Add Step', exact: true }),
	).toHaveClass(/MuiButton-outlinedPrimary/);
	await expect(
		page.getByText('Upload Image (optional)', { exact: true }),
	).toHaveClass(/MuiButton-outlinedPrimary/);
	const fields = await page
		.locator('form')
		.evaluate((form) =>
			[...form.querySelectorAll('input')].map((input) => input.name),
		);
	expect(fields.slice(0, 2)).toEqual(['name', 'category']);
	await createButton(page).click();
	await expect(page.locator('html')).not.toHaveAttribute('data-add-data');
});

test('server-action form receives the same hidden JSON, fractions, category and file payload', async ({
	page,
}) => {
	await page.goto(addPath);
	await fillBasics(page);
	await fillRows(page);
	await page
		.getByRole('textbox', { name: 'Quantity', exact: true })
		.fill('1/2');
	await page.getByRole('combobox', { name: /^Unit/ }).click();
	await page.getByRole('option', { name: 'Other…', exact: true }).click();
	await page
		.getByRole('textbox', { name: 'Custom unit', exact: true })
		.fill(' ladle ');
	await page
		.getByRole('textbox', { name: 'Step 1', exact: true })
		.fill('  Cook gently.  ');
	await page
		.getByRole('button', { name: '+ Add Ingredient', exact: true })
		.click(); // Empty rows are discarded.
	await page.getByRole('button', { name: '+ Add Step', exact: true }).click();
	await page
		.locator('input[type=file]')
		.setInputFiles(path.resolve('public/images/branding/logo-face.png'));
	await expect(
		page.getByText('Selected: logo-face.png', { exact: true }),
	).toBeVisible();
	await createButton(page).click();
	const data = await submitted(page);
	expect(Object.keys(data).sort()).toEqual(
		[
			'name',
			'category',
			'imageFile',
			'prepTime',
			'cookTime',
			'serves',
			'ingredients',
			'steps',
		].sort(),
	);
	expect(data).toMatchObject({
		name: 'Family pasta',
		category: 'bbbbbbbbbbbbbbbbbbbbbbbb',
		prepTime: '10',
		cookTime: '15',
		serves: '2',
		imageFile: { name: 'logo-face.png' },
	});
	expect(JSON.parse(String(data.ingredients))).toEqual([
		{ ingredient: 'pasta', quantity: 0.5, unit: 'ladle', customUnit: 'ladle' },
	]);
	expect(JSON.parse(String(data.steps))).toEqual(['Cook gently.']);
	await expect(page.locator('input[name=ingredients]')).toHaveAttribute(
		'type',
		'hidden',
	);
	await expect(page.locator('input[name=steps]')).toHaveAttribute(
		'type',
		'hidden',
	);
	await expect(createButton(page)).toBeEnabled(); // No new pending logic.
	await page.evaluate(() =>
		window.dispatchEvent(new Event('fixture-add-complete')),
	);
	await expect(page).toHaveURL('/recipes/cccccccccccccccccccccccc');
});

test('validation blocks submission and retains field values and inline error clearing', async ({
	page,
}) => {
	await page.goto(addPath);
	await fillBasics(page);
	await createButton(page).click();
	await expect(
		page.getByText('Please add at least one step.', { exact: true }),
	).toBeVisible();
	await page.getByRole('button', { name: '+ Add Step', exact: true }).click();
	await page
		.getByRole('textbox', { name: 'Step 1', exact: true })
		.fill('Cook.');
	await createButton(page).click();
	await expect(
		page.getByText('Please add at least one ingredient.', { exact: true }),
	).toBeVisible();
	await page
		.getByRole('button', { name: '+ Add Ingredient', exact: true })
		.click();
	await page
		.getByRole('textbox', { name: 'Ingredient', exact: true })
		.fill('olive oil');
	await page.getByRole('combobox', { name: /^Unit/ }).click();
	await page.getByRole('option', { name: 'Other…', exact: true }).click();
	await createButton(page).click();
	await expect(
		page.getByText('Please enter a quantity.', { exact: true }),
	).toBeVisible();
	await expect(
		page.getByText('Please type the custom unit.', { exact: true }),
	).toBeVisible();
	await expect(
		page.getByText('Please fix the highlighted ingredient fields.', {
			exact: true,
		}),
	).toBeVisible();
	await expect(page.locator('html')).not.toHaveAttribute('data-add-data');
	await expect(page.getByRole('textbox', { name: /Recipe Name/ })).toHaveValue(
		'Family pasta',
	);
	await page.getByRole('textbox', { name: 'Quantity', exact: true }).fill('2');
	await expect(
		page.getByText('Please enter a quantity.', { exact: true }),
	).toHaveCount(0);
	await page.getByRole('combobox', { name: /^Unit/ }).click();
	await page.getByRole('option', { name: 'g', exact: true }).click();
	await expect(
		page.getByText('Please type the custom unit.', { exact: true }),
	).toHaveCount(0);
});

test('add/remove callbacks retain remaining row values and single-line steps', async ({
	page,
}) => {
	await page.goto(addPath);
	await fillBasics(page);
	await fillRows(page);
	await page
		.getByRole('button', { name: '+ Add Ingredient', exact: true })
		.click();
	await page
		.getByRole('textbox', { name: 'Ingredient', exact: true })
		.nth(1)
		.fill('garlic cloves');
	await page
		.getByRole('textbox', { name: 'Quantity', exact: true })
		.nth(1)
		.fill('2');
	await page
		.getByRole('button', { name: 'Remove ingredient', exact: true })
		.first()
		.click();
	await expect(
		page.getByRole('textbox', { name: 'Ingredient', exact: true }),
	).toHaveValue('garlic cloves');
	await page.getByRole('button', { name: '+ Add Step', exact: true }).click();
	await page
		.getByRole('textbox', { name: 'Step 2', exact: true })
		.fill('Serve.');
	await page
		.getByRole('button', { name: 'Remove step', exact: true })
		.first()
		.click();
	await expect(
		page.getByRole('textbox', { name: 'Step 1', exact: true }),
	).toHaveValue('Serve.');
	await expect(
		page.getByRole('textbox', { name: 'Step 1', exact: true }),
	).toHaveJSProperty('tagName', 'INPUT');
	await createButton(page).click();
	const data = await submitted(page);
	expect(JSON.parse(String(data.ingredients))).toEqual([
		{ ingredient: 'garlic cloves', quantity: '2', unit: '', customUnit: '' },
	]);
	expect(JSON.parse(String(data.steps))).toEqual(['Serve.']);
});

test('empty-category fallback and Home destination stay unchanged', async ({
	page,
}) => {
	await page.goto(`${addPath}?empty-categories`);
	await page.getByRole('combobox', { name: /Category/ }).click();
	await expect(
		page.getByRole('option', { name: 'No categories available' }),
	).toHaveAttribute('aria-disabled', 'true');
	await page.keyboard.press('Escape');
	await page.getByRole('link', { name: 'Back to Home', exact: true }).click();
	await expect(page).toHaveURL('/');
});

for (const [name, width] of [
	['desktop', 1440],
	['mobile', 390],
	['small-mobile', 320],
	['tablet', 640],
] as const) {
	test(`${name} initial/populated/validation layouts remain usable without overflow`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(addPath);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'Add a Recipe',
		);
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction(() =>
			Array.from(document.images).every(
				(image) => image.complete && image.naturalWidth > 0,
			),
		);
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(248, 245, 238)',
		);
		await expect(page.locator('.site-appbar img').first()).toHaveAttribute(
			'src',
			/logo-face/,
		);
		await expect(page.getByRole('textbox', { name: /Recipe Name/ })).toHaveCSS(
			'padding-left',
			'14px',
		);
		for (const state of ['initial', 'populated', 'validation']) {
			if (state === 'populated') {
				await fillBasics(page);
				await fillRows(page);
			}
			if (state === 'validation') {
				await page
					.getByRole('textbox', { name: 'Quantity', exact: true })
					.fill('');
				await createButton(page).click();
				await expect(
					page.getByText('Please enter a quantity.', { exact: true }),
				).toBeVisible();
			}
			const overflow = await page.locator('main').evaluate((main) =>
				[...main.querySelectorAll('*')]
					.filter((node) => {
						if (
							(node instanceof HTMLInputElement && node.type === 'file') ||
							node.getAttribute('aria-hidden') === 'true'
						)
							return false;
						const rect = node.getBoundingClientRect();
						return (
							rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1)
						);
					})
					.map((node) => node.tagName),
			);
			expect(overflow).toEqual([]);
			for (const button of await page
				.locator('main button, main .MuiButton-root')
				.all()) {
				const rect = await button.boundingBox();
				expect(Math.round(rect!.height)).toBeGreaterThanOrEqual(44);
			}
			if (name === 'desktop' || name === 'mobile') {
				await mkdir('output/playwright/recipe-add', { recursive: true });
				await page.screenshot({
					path: `output/playwright/recipe-add/${name}-${state}.png`,
					fullPage: true,
				});
			}
		}
		const prep = await page
			.getByRole('spinbutton', { name: /Prep Time/ })
			.boundingBox();
		const cook = await page
			.getByRole('spinbutton', { name: /Cook Time/ })
			.boundingBox();
		if (width < 640) {
			expect(cook!.y).toBeGreaterThan(prep!.y);
			const form = await page.locator('form').boundingBox();
			const button = await createButton(page).boundingBox();
			expect(button!.width).toBeCloseTo(form!.width, 0);
		} else expect(cook!.y).toBe(prep!.y);
		await page.getByRole('combobox', { name: /^Unit/ }).click();
		await expect(
			page.getByRole('option', { name: 'Other…', exact: true }),
		).toBeVisible();
		const menu = await page.getByRole('listbox').boundingBox();
		expect(menu!.x).toBeGreaterThanOrEqual(0);
		expect(menu!.x + menu!.width).toBeLessThanOrEqual(width);
	});
}
