import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { collectBrowserErrors } from './helpers/browserErrors';

// Use the existing authenticated-home fixture pattern to exercise the actual
// profile page and shared controls without database writes or a real account.
const require = createRequire(import.meta.url);
const { build } = require(
	require.resolve('esbuild', { paths: [require.resolve('tsx')] }),
) as {
	build(
		options: Record<string, unknown>,
	): Promise<{ outputFiles: { text: string }[] }>;
};
const profilePath = '/recipes/profile';
const fixture = JSON.stringify(path.resolve('tests/fixtures/profile.tsx'));
const shims: Record<string, string> = {
	'@/config/database': `export {connectDB as default} from ${fixture};`,
	'@/models/User': `export {userModel as default} from ${fixture};`,
	'@/models/Recipe': `export {recipeModel as default} from ${fixture};`,
	'@/utils/getSessionUser': `export {getSessionUser} from ${fixture};`,
	'@/utils/recipeAccess':
		'export function readableRecipeFilter(id) {return {$or:[{user:id},{sharedWith:id}]};}',
	'@/app/actions/updateProfileDetails': `export {updateProfileDetails as default} from ${fixture};`,
	'@/app/actions/updateProfileImage': `export {updateProfileImage as default} from ${fixture};`,
	'@/app/actions/deleteAccount': `export {deleteAccount} from ${fixture};`,
	'@/app/actions/bookmarkRecipe': `export {bookmark as default} from ${fixture};`,
	'next-auth/react': `export {SessionProvider, useSession} from ${JSON.stringify(require.resolve('next-auth/react'))}; export {signOut} from ${fixture};`,
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
		entryPoints: ['tests/fixtures/profile.tsx'],
		bundle: true,
		write: false,
		platform: 'browser',
		format: 'iife',
		jsx: 'automatic',
		loader: { '.js': 'jsx', '.jsx': 'jsx' },
		define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}' },
		plugins: [
			{
				name: 'profile-fixture-boundaries',
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
							? { path: args.path, namespace: 'profile-shim' }
							: undefined,
					);
					builder.onLoad(
						{ filter: /.*/, namespace: 'profile-shim' },
						(args) => ({
							contents: shims[args.path],
							loader: 'js',
							resolveDir: process.cwd(),
						}),
					);
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
	await page.route('**/__profile-fixture.js', (route) =>
		route.fulfill({ contentType: 'text/javascript', body: bundle }),
	);
	await page.route(
		(url) => url.pathname === profilePath,
		(route) =>
			route.fulfill({
				contentType: 'text/html',
				body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Profile review fixture</title>${appearance.styles}</head><body><div id="root"></div><script>document.documentElement.dataset.bodyFont=${JSON.stringify(appearance.bodyFont)};document.documentElement.dataset.wordmarkFont=${JSON.stringify(appearance.wordmarkFont)};</script><script src="/__profile-fixture.js"></script></body></html>`,
			}),
	);
});
test.afterEach(() => expect(browserErrors).toEqual([]));

async function complete(page: import('@playwright/test').Page, action: string) {
	await page.evaluate(
		(name) => window.dispatchEvent(new Event(`fixture-${name}-complete`)),
		action,
	);
}

test('account details, inputs, actions and owned/bookmarked recipes retain their content', async ({
	page,
}) => {
	await page.goto(profilePath);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Your profile',
	);
	await expect(page.getByLabel('First Name', { exact: true })).toHaveValue(
		'Rebekah',
	);
	await expect(page.getByLabel('Last Name', { exact: true })).toHaveValue(
		'Tester',
	);
	await expect(page.getByLabel('Email', { exact: true })).toHaveValue(
		'rebekah@example.test',
	);
	await expect(page.getByLabel('First Name', { exact: true })).toHaveCSS(
		'padding-left',
		'14px',
	);
	await expect(page.getByLabel('Email', { exact: true })).toHaveCSS(
		'padding-left',
		'0px',
	);
	await expect(
		page.getByRole('button', { name: 'Save Changes', exact: true }),
	).toHaveCSS('background-color', 'rgb(26, 32, 39)');
	await expect(
		page.getByRole('button', { name: 'Delete my Acount', exact: true }),
	).toHaveClass(/MuiButton-outlinedError/);
	await expect(
		page
			.getByRole('region', { name: 'Your Recipes', exact: true })
			.locator('.MuiCard-root'),
	).toHaveCount(2);
	await expect(
		page
			.getByRole('region', { name: 'Bookmarked Recipes', exact: true })
			.locator('.MuiCard-root'),
	).toHaveCount(2);
	const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
	await expect(page.locator('html')).toHaveAttribute(
		'data-owned-filter',
		JSON.stringify({ user: id }),
	);
	await expect(page.locator('html')).toHaveAttribute(
		'data-bookmark-filter',
		JSON.stringify({ $or: [{ user: id }, { sharedWith: id }] }),
	);
});

test('save retains pending, failure and successful refresh behaviour', async ({
	page,
}) => {
	await page.goto(profilePath);
	await page.getByLabel('First Name', { exact: true }).fill('Updated');
	await page.evaluate(() => {
		document.documentElement.dataset.saveResult = 'failure';
	});
	await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
	await expect(
		page.getByRole('button', { name: 'Saving...', exact: true }),
	).toBeDisabled();
	await complete(page, 'save');
	await expect(
		page.getByText('Failed to update profile.', { exact: true }),
	).toBeVisible();
	await expect(page.getByLabel('First Name', { exact: true })).toHaveValue(
		'Updated',
	);
	await page.evaluate(() => {
		delete document.documentElement.dataset.saveResult;
	});
	await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
	await complete(page, 'save');
	await expect(
		page.getByText('Profile updated!', { exact: true }),
	).toBeVisible();
	await expect(page.locator('html')).toHaveAttribute('data-refresh-calls', '1');
	expect(await page.locator('html').getAttribute('data-sign-out')).toBeNull();
});

test('email change retains verification help and sign-out destination', async ({
	page,
}) => {
	await page.goto(profilePath);
	await page.getByLabel('Email', { exact: true }).fill('new@example.test');
	await expect(
		page.getByLabel('Email', { exact: true }),
	).toHaveAccessibleDescription(
		'Changing your email will require verification',
	);
	await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
	await complete(page, 'save');
	await expect(page.locator('html')).toHaveAttribute(
		'data-sign-out',
		'/recipes/verify/check-email?email=new%40example.test',
	);
	await expect(page).toHaveURL(
		'/recipes/verify/check-email?email=new%40example.test',
	);
});

test('avatar upload preserves disabled input, preview, parent and real session updates', async ({
	page,
}) => {
	await page.goto(profilePath);
	const input = page.locator('main input[type=file]');
	await input.setInputFiles(
		path.resolve('public/images/branding/logo-face.png'),
	);
	await expect(input).toBeDisabled();
	await complete(page, 'upload');
	await expect(input).toBeEnabled();
	await expect(
		page.getByText('Profile image updated successfully!', { exact: true }),
	).toBeVisible();
	await expect(page.locator('main .MuiAvatar-root img')).toHaveAttribute(
		'src',
		'/images/branding/logo-face.png?profile-upload=1',
	);
	await expect(
		page.locator('.site-appbar .MuiAvatar-root img'),
	).toHaveAttribute('src', /profile-upload/);
	await expect(page.locator('html')).toHaveAttribute(
		'data-session-update',
		/profile-upload=1/,
	);
});

test('avatar upload failure keeps the fallback and permits retry', async ({
	page,
}) => {
	await page.goto(profilePath);
	await page.evaluate(() => {
		document.documentElement.dataset.uploadResult = 'failure';
	});
	const input = page.locator('main input[type=file]');
	await input.setInputFiles(
		path.resolve('public/images/branding/logo-face.png'),
	);
	await complete(page, 'upload');
	await expect(
		page.getByText('Error updating profile image. Please try again.', {
			exact: true,
		}),
	).toBeVisible();
	await expect(input).toBeEnabled();
	await expect(page.locator('main .MuiAvatar-root img')).toHaveCount(0);
});

test('account deletion retains confirmation, pending, failure and sign-out behaviour', async ({
	page,
}) => {
	await page.goto(profilePath);
	const button = page.getByRole('button', {
		name: 'Delete my Acount',
		exact: true,
	});
	page.once('dialog', async (dialog) => {
		expect(dialog.message()).toBe(
			'Are you sure you want to delete your account? This cannot be undone.',
		);
		await dialog.dismiss();
	});
	await button.click();
	expect(
		await page.locator('html').getAttribute('data-delete-calls'),
	).toBeNull();
	for (const result of ['failure', 'throw', 'success']) {
		await page.evaluate((value) => {
			document.documentElement.dataset.deleteResult = value;
		}, result);
		page.once('dialog', (dialog) => dialog.accept());
		await button.click();
		await expect(
			page.getByRole('button', { name: 'Deleting...', exact: true }),
		).toBeDisabled();
		await complete(page, 'delete');
		if (result === 'success') {
			await expect(page.locator('html')).toHaveAttribute(
				'data-sign-out',
				'/recipes/signin?deleted=1',
			);
		} else {
			await expect(button).toBeEnabled();
			await expect(
				page.getByText(
					result === 'failure'
						? 'Failed to delete account. Please try again.'
						: 'Something went wrong deleting your account.',
					{ exact: true },
				),
			).toBeVisible();
		}
	}
});

test('bookmarked cards retain optimistic toggle, rollback and recipe links', async ({
	page,
}) => {
	await page.goto(profilePath);
	const card = page
		.getByRole('region', { name: 'Bookmarked Recipes', exact: true })
		.locator('.MuiCard-root')
		.first();
	await page.evaluate(() => {
		document.documentElement.dataset.bookmarkResult = 'failure';
	});
	await card
		.getByRole('button', { name: 'Remove Bookmark', exact: true })
		.click();
	await expect(
		card.getByRole('button', { name: 'Add Bookmark', exact: true }),
	).toHaveAttribute('aria-pressed', 'false');
	await complete(page, 'bookmark');
	await expect(
		card.getByRole('button', { name: 'Remove Bookmark', exact: true }),
	).toHaveAttribute('aria-pressed', 'true');
	await page.evaluate(() => {
		delete document.documentElement.dataset.bookmarkResult;
	});
	await card
		.getByRole('button', { name: 'Remove Bookmark', exact: true })
		.click();
	await complete(page, 'bookmark');
	await expect(page.getByText(/removed from your bookmarks/)).toBeVisible();
	await card.getByRole('link').click();
	await expect(page).toHaveURL('/recipes/111111111111111111111111');
});

for (const [scenario, message] of [
	['empty', "You haven't saved any recipes yet."],
	['signed-out', 'Please log in to access your profile.'],
	['missing', 'Unable to load your profile details.'],
	[
		'error',
		'Something went wrong while loading your profile. Please try again later.',
	],
]) {
	test(`${scenario} retains the existing message`, async ({ page }) => {
		await page.goto(`${profilePath}?scenario=${scenario}`);
		await expect(page.getByText(message, { exact: true })).toBeVisible();
	});
}

for (const [name, width] of [
	['desktop', 1440],
	['mobile', 390],
	['small-mobile', 320],
	['tablet-breakpoint', 640],
] as const) {
	test(`${name} profile stays within the viewport and captures the first pass`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(profilePath);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'Your profile',
		);
		await page.evaluate(() => document.fonts.ready);
		const images = page.locator('main img');
		await expect(images).toHaveCount(4);
		for (let index = 0; index < 4; index++) {
			const image = images.nth(index);
			await image.scrollIntoViewIfNeeded();
			await expect
				.poll(
					() =>
						image.evaluate(
							(element) => (element as HTMLImageElement).naturalWidth,
						),
					{
						message: `Profile recipe image ${index + 1} should load`,
					},
				)
				.toBeGreaterThan(0);
		}
		await page.evaluate(() => scrollTo(0, 0));
		await expect(page.locator('body')).toHaveCSS(
			'background-color',
			'rgb(248, 245, 238)',
		);
		await expect(page.locator('.site-appbar img').first()).toHaveAttribute(
			'src',
			/logo-face/,
		);
		for (const card of await page.locator('main .MuiCard-root').all())
			await expect(card).toHaveCSS('box-shadow', 'none');
		const overflow = await page.locator('main').evaluate((main) =>
			[...main.querySelectorAll('*')]
				.filter((node) => {
					const rect = node.getBoundingClientRect();
					return (
						rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1)
					);
				})
				.map((node) => node.tagName),
		);
		expect(overflow).toEqual([]);
		const upload = page.getByLabel('Change profile picture', { exact: true });
		await expect(upload).toHaveCSS('width', width < 600 ? '28px' : '30px');
		await expect(upload).toHaveCSS('box-shadow', 'none');
		const cards = await page
			.getByRole('region', { name: 'Bookmarked Recipes', exact: true })
			.locator('.MuiCard-root')
			.evaluateAll((nodes) =>
				nodes.map((node) => ({
					x: node.getBoundingClientRect().x,
					y: node.getBoundingClientRect().y,
				})),
			);
		if (width < 640) expect(cards[1].y).toBeGreaterThan(cards[0].y);
		else expect(cards[1].x).toBeGreaterThan(cards[0].x);
		if (name === 'desktop' || name === 'mobile') {
			await mkdir('output/playwright/profile', { recursive: true });
			await page.screenshot({
				path: `output/playwright/profile/profile-${name}.png`,
				fullPage: true,
			});
		}
	});
}
