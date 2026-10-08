import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect, type Page } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.PORTFOLIO_BASE_URL ?? 'http://localhost:3000';
const outputDir = path.join(root, 'public/portfolio/rebekahs-recipes');
const recipeId = 'cccccccccccccccccccccccc';
const require = createRequire(import.meta.url);
const { build } = require(require.resolve('esbuild', { paths: [require.resolve('tsx')] })) as {
	build(options: Record<string, unknown>): Promise<{ outputFiles: { text: string }[] }>;
};

type FixtureName = 'landing' | 'home' | 'detail' | 'profile' | 'import' | 'add' | 'edit';
type Fixture = { route: string; file: string; shims: Record<string, string>; mode?: 'test' };
const fixtureFile = (name: string) => path.join(root, `tests/fixtures/${name}.tsx`);
const fixtureRef = (name: string) => JSON.stringify(fixtureFile(name));
const commonShims = (file: string): Record<string, string> => ({
	'next/navigation': `export {useRouter, usePathname} from ${file}; export function useServerInsertedHTML() {}`,
	'next/link': `export {FixtureLink as default} from ${file};`,
	'next/image': "export {Image as default} from 'next/dist/client/image-component';",
	'next/font/google': 'export function Archivo() {return {style: {fontFamily: document.documentElement.dataset.bodyFont}};} export function Shadows_Into_Light() {return {style: {fontFamily: document.documentElement.dataset.wordmarkFont}};}',
});

const home = fixtureRef('authenticated-home');
const landing = JSON.stringify(path.join(root, 'scripts/portfolio-landing.tsx'));
const detail = fixtureRef('recipe-detail');
const profile = fixtureRef('profile');
const imported = fixtureRef('recipe-import');
const add = fixtureRef('recipe-add');
const edit = fixtureRef('recipe-edit');
const fixtures: Record<FixtureName, Fixture> = {
	landing: {
		route: '/', file: path.join(root, 'scripts/portfolio-landing.tsx'),
		shims: commonShims(landing),
	},
	home: {
		route: '/', file: fixtureFile('authenticated-home'),
		shims: {
			...commonShims(home),
			'@/config/database': 'export default async function connectDB() {}',
			'../models/Recipe': `import {data} from ${home}; export default {find: () => {const query = {populate: () => query, lean: async () => data().recipes}; return query;}};`,
			'@/models/Category': `import {data} from ${home}; export default {find: () => ({lean: async () => data().categories})};`,
			'@/utils/getSessionUser': `import {data} from ${home}; export async function getSessionUser() {return data().user;}`,
			'@/utils/recipeAccess': `import {data} from ${home}; export async function getSharedRecipesForViewer() {return data().shared;}`,
			'@/app/actions/bookmarkRecipe': `export {bookmark as default} from ${home};`,
			'next/headers': "export async function headers() {return new Headers({'x-url': location.href});}",
		},
	},
	detail: {
		route: `/recipes/${recipeId}`, file: fixtureFile('recipe-detail'),
		shims: {
			...commonShims(detail),
			'@/utils/getSessionUser': `import {data} from ${detail}; export async function getSessionUser() {return data().user;}`,
			'@/utils/recipeAccess': `import {data} from ${detail}; export async function getRecipeForViewer() {return data().recipe;}`,
			'@/app/actions/bookmarkRecipe': `export {bookmark as default} from ${detail};`,
			'@/app/actions/deleteRecipe': `export {deleteRecipe as default} from ${detail};`,
			'@/app/actions/recipeSharing': `export * from ${JSON.stringify(path.join(root, 'tests/fixtures/recipe-sharing-actions.ts'))};`,
		},
	},
	profile: {
		route: '/recipes/profile', file: fixtureFile('profile'),
		shims: {
			...commonShims(profile),
			'@/config/database': `export {connectDB as default} from ${profile};`,
			'@/models/User': `export {userModel as default} from ${profile};`,
			'@/models/Recipe': `export {recipeModel as default} from ${profile};`,
			'@/utils/getSessionUser': `export {getSessionUser} from ${profile};`,
			'@/utils/recipeAccess': 'export function readableRecipeFilter(id) {return {$or:[{user:id},{sharedWith:id}]};}',
			'@/app/actions/updateProfileDetails': `export {updateProfileDetails as default} from ${profile};`,
			'@/app/actions/updateProfileImage': `export {updateProfileImage as default} from ${profile};`,
			'@/app/actions/deleteAccount': `export {deleteAccount} from ${profile};`,
			'@/app/actions/bookmarkRecipe': `export {bookmark as default} from ${profile};`,
			'next-auth/react': `export {SessionProvider, useSession} from ${JSON.stringify(require.resolve('next-auth/react'))}; export {signOut} from ${profile};`,
		},
	},
	import: {
		route: '/recipes/copyWeb', file: fixtureFile('recipe-import'),
		shims: {
			...commonShims(imported),
			'@/app/actions/getCategories': `export {getCategories} from ${imported};`,
			'../app/actions/scrapeData': `export {scrapeData} from ${imported};`,
			'@/app/actions/saveScrapedRecipe': `export {saveScrapedRecipe} from ${imported};`,
		},
	},
	add: {
		route: '/recipes/add', file: fixtureFile('recipe-add'), mode: 'test',
		shims: {
			...commonShims(add),
			'@/app/actions/getCategories': `export {getCategories} from ${add};`,
			'@/app/actions/addRecipe': `export {addRecipe as default} from ${add};`,
		},
	},
	edit: {
		route: `/recipes/${recipeId}/edit`, file: fixtureFile('recipe-edit'), mode: 'test',
		shims: {
			...commonShims(edit),
			'mongoose': 'export default { Types: { ObjectId: { isValid: value => /^[a-f0-9]{24}$/i.test(value) } } };',
			'@/config/database': `export {connectDB as default} from ${edit};`,
			'@/models/Recipe': `export {recipeModel as default} from ${edit};`,
			'@/models/Category': `export {categoryModel as default} from ${edit};`,
			'@/utils/getSessionUser': `export {getSessionUser} from ${edit};`,
			'@/app/actions/editRecipe': `export {updateRecipe as default} from ${edit};`,
			'@/app/actions/deleteRecipe': `export {deleteRecipe as default} from ${edit};`,
		},
	},
};

async function buildFixture(name: FixtureName) {
	const fixture = fixtures[name];
	const namespace = `portfolio-${name}-shim`;
	const result = await build({
		entryPoints: [fixture.file], bundle: true, write: false, platform: 'browser',
		format: 'iife', jsx: 'automatic', loader: { '.js': 'jsx', '.jsx': 'jsx' },
		define: { 'process.env.NODE_ENV': JSON.stringify(fixture.mode ?? 'development'), 'process.env': '{}' },
		plugins: [{
			name: namespace,
			setup(builder: {
				onResolve(options: { filter: RegExp }, callback: (args: { path: string }) => { path: string; namespace: string } | undefined): void;
				onLoad(options: { filter: RegExp; namespace: string }, callback: (args: { path: string }) => { contents: string; loader: 'js'; resolveDir: string }): void;
			}) {
				builder.onResolve({ filter: /.*/ }, args => fixture.shims[args.path] ? { path: args.path, namespace } : undefined);
				builder.onLoad({ filter: /.*/, namespace }, args => ({ contents: fixture.shims[args.path], loader: 'js', resolveDir: root }));
			},
		}],
	});
	return result.outputFiles[0].text;
}

async function serverReady() {
	try {
		const response = await fetch(new URL('/privacy-policy', baseUrl), { signal: AbortSignal.timeout(3000) });
		return response.ok;
	} catch {
		return false;
	}
}

async function ensureServer(): Promise<ChildProcess | null> {
	if (await serverReady()) return null;
	if (process.env.PORTFOLIO_BASE_URL) throw new Error(`No app server at ${baseUrl}`);
	const server = spawn('pnpm', ['dev:test'], {
		cwd: root, stdio: 'inherit', detached: true,
		env: { ...process.env, NEXTAUTH_URL: baseUrl },
	});
	for (let attempt = 0; attempt < 120; attempt++) {
		if (await serverReady()) return server;
		if (server.exitCode !== null) throw new Error(`App server exited with code ${server.exitCode}`);
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
	throw new Error(`App server did not become ready at ${baseUrl}`);
}

function stopServer(server: ChildProcess | null) {
	if (!server) return;
	if (server.pid) process.kill(-server.pid, 'SIGTERM');
	else server.kill('SIGTERM');
}

async function mountFixture(page: Page, name: FixtureName, bundle: string, query = '') {
	await page.unrouteAll({ behavior: 'wait' });
	await page.goto(new URL('/privacy-policy', baseUrl).href, { waitUntil: 'domcontentloaded' });
	await expect(page.locator('.site-appbar img').first()).toBeVisible();
	const appearance = await page.evaluate(() => ({
		styles: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(link => link.outerHTML).join(''),
		bodyFont: getComputedStyle(document.body).fontFamily,
		wordmarkFont: getComputedStyle(document.querySelector('.site-appbar a .MuiTypography-root:last-child')!).fontFamily,
	}));
	const fixture = fixtures[name];
	const scriptPath = `/__portfolio-${name}-fixture.js`;
	await page.route('**/api/auth/**', route => route.fulfill({ json: name === 'landing' ? null : {
		user: { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Rebekah Tester', email: 'rebekah@example.test', image: null },
		expires: '2099-01-01T00:00:00.000Z',
	} }));
	await page.route(`**${scriptPath}`, route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
	await page.route(url => url.pathname === fixture.route, route => route.fulfill({
		contentType: 'text/html',
		body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Rebekah's Recipes portfolio</title>${appearance.styles}</head><body><div id="root"></div><script>document.documentElement.dataset.bodyFont=${JSON.stringify(appearance.bodyFont)};document.documentElement.dataset.wordmarkFont=${JSON.stringify(appearance.wordmarkFont)};</script><script src="${scriptPath}"></script></body></html>`,
	}));
	await page.goto(new URL(fixture.route + query, baseUrl).href, { waitUntil: 'domcontentloaded' });
}

async function capture(page: Page, name: string) {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addStyleTag({ content: `
		*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; scroll-behavior: auto !important; }
		.Toastify__toast-container, .MuiSnackbar-root, .MuiSkeleton-root, .MuiCircularProgress-root { display: none !important; }
	` });
	await page.evaluate(() => document.fonts.ready);
	await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
	const images = page.locator('img');
	for (let index = 0, count = await images.count(); index < count; index++) {
		const image = images.nth(index);
		await image.scrollIntoViewIfNeeded();
		await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth), {
			message: `${name}: image ${index + 1} should load`,
		}).toBeGreaterThan(0);
	}
	await page.evaluate(() => scrollTo(0, 0));
	const file = path.join(outputDir, `${name}.png`);
	await page.screenshot({ path: file, fullPage: true, animations: 'disabled', caret: 'hide', scale: 'device' });
	console.log(`Saved ${path.relative(root, file)}`);
}

async function fillAddRecipe(page: Page) {
	await page.getByRole('textbox', { name: /Recipe Name/ }).fill('Family pasta');
	await page.getByRole('combobox', { name: /Category/ }).click();
	await page.getByRole('option', { name: 'Pasta', exact: true }).click();
	await page.getByRole('spinbutton', { name: /Prep Time/ }).fill('10');
	await page.getByRole('spinbutton', { name: /Cook Time/ }).fill('15');
	await page.getByRole('spinbutton', { name: /Serves/ }).fill('2');
	await page.getByRole('button', { name: '+ Add Ingredient', exact: true }).click();
	await page.getByRole('textbox', { name: 'Ingredient', exact: true }).fill('pasta');
	await page.getByRole('textbox', { name: 'Quantity', exact: true }).fill('200');
	await page.getByRole('combobox', { name: /^Unit/ }).click();
	await page.getByRole('option', { name: 'g', exact: true }).click();
	await page.getByRole('button', { name: '+ Add Step', exact: true }).click();
	await page.getByRole('textbox', { name: 'Step 1', exact: true }).fill('Cook the pasta in salted water.');
	await page.locator('form input[type=file]').setInputFiles(path.join(root, 'public/images/landing/hero-pasta.jpg'));
}

async function captureViewport(label: 'desktop' | 'mobile', viewport: { width: number; height: number }, bundles: Record<FixtureName, string>) {
	const browser = await chromium.launch();
	const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'en-GB', colorScheme: 'light' });
	try {
		const page = await context.newPage();
		await page.clock.setFixedTime(new Date('2026-10-01T12:00:00Z'));
		await mountFixture(page, 'landing', bundles.landing);
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Keep all the recipes you love');
		await capture(page, `01-landing-${label}`);

		await mountFixture(page, 'home', bundles.home);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello, Rebekah!');
		await expect(page.getByTestId('home-recipe-card')).toHaveCount(3);
		await capture(page, `02-library-${label}`);

		await mountFixture(page, 'detail', bundles.detail);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Weeknight pesto pasta');
		await expect(page.getByRole('region', { name: 'Ingredients:' })).toBeVisible();
		await capture(page, `03-recipe-detail-${label}`);

		await mountFixture(page, 'profile', bundles.profile);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your profile');
		await expect(page.getByRole('region', { name: 'Bookmarked Recipes' }).locator('.MuiCard-root')).toHaveCount(2);
		await capture(page, `04-profile-${label}`);

		await mountFixture(page, 'import', bundles.import, '?url=https%3A%2F%2Fwww.bbcgoodfood.com%2Frecipes%2Fpasta');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Save a recipe from the web');
		await expect(page.getByRole('button', { name: 'Import Recipe', exact: true })).toBeVisible();
		await capture(page, `05-import-url-${label}`);
		await page.getByRole('button', { name: 'Import Recipe', exact: true }).click();
		await expect(page.getByRole('status')).toHaveText('Weeknight tomato pasta');
		await page.getByRole('combobox', { name: 'Category' }).click();
		await page.getByRole('option', { name: 'Pasta', exact: true }).click();
		await capture(page, `06-import-preview-${label}`);

		await mountFixture(page, 'add', bundles.add);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Add a Recipe');
		await fillAddRecipe(page);
		await capture(page, `07-add-recipe-${label}`);

		await mountFixture(page, 'edit', bundles.edit);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit Recipe');
		await capture(page, `08-edit-recipe-${label}`);
	} finally {
		await context.close();
		await browser.close();
	}
}

async function main() {
	await mkdir(outputDir, { recursive: true });
	const server = await ensureServer();
	try {
		const names = Object.keys(fixtures) as FixtureName[];
		const built = await Promise.all(names.map(async name => [name, await buildFixture(name)] as const));
		const bundles = Object.fromEntries(built) as Record<FixtureName, string>;
		await captureViewport('desktop', { width: 1440, height: 900 }, bundles);
		await captureViewport('mobile', { width: 390, height: 844 }, bundles);
	} finally {
		stopServer(server);
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
