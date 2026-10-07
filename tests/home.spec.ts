import { test, expect } from '@playwright/test';
import { usesHomeTheme, usesPublicTheme } from '../theme/publicRoutes';

test('public theme is limited to guest home and explicit account/legal routes', () => {
	expect(usesPublicTheme('/', false)).toBe(true);
	expect(usesPublicTheme('/', true)).toBe(false);
	expect(usesHomeTheme('/', true)).toBe(true);
	expect(usesHomeTheme('/', false)).toBe(false);
	for (const path of [
		'/recipes/signin', '/recipes/register', '/recipes/forgot-password',
		'/recipes/reset-password', '/recipes/verify', '/recipes/verify/check-email',
		'/recipes/verify/invalid', '/recipes/verify/success',
		'/privacy-policy', '/terms-of-service',
	]) {
		expect(usesPublicTheme(path, false)).toBe(true);
		expect(usesPublicTheme(path, true)).toBe(true);
		expect(usesHomeTheme(path, true)).toBe(false);
	}
	for (const path of ['/recipes', '/recipes/search-results', '/recipes/add', '/recipes/copyWeb', '/recipes/example', '/recipes/profile', '/recipes/register/extra', '/recipes/verify-other']) {
		expect(usesPublicTheme(path, false)).toBe(false);
		expect(usesPublicTheme(path, true)).toBe(false);
		expect(usesHomeTheme(path, true)).toBe(false);
	}
});

test('guest shell has its public theme and brand before JavaScript loads', async ({ browser, baseURL }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	try {
		const page = await context.newPage();
		await page.goto(baseURL!);
		await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
		await expect(page.locator('.site-appbar img')).toHaveAttribute('src', /logo-face\.png/);
		await expect(page.locator('.site-footer img')).toHaveAttribute('src', /logo-face\.png/);
	} finally {
		await context.close();
	}
});

test('guest menu keeps its public treatment on sign-in and legal navigation', async ({ page }) => {
	await page.goto('/');
	await page.locator('.site-appbar button').last().click();
	const menu = page.getByRole('menu');
	await expect(menu).toBeVisible();
	await expect(menu.locator('..')).toHaveCSS('box-shadow', 'none');
	await expect(menu.locator('..')).toHaveCSS('border-top-style', 'solid');
	await page.getByRole('menuitem', { name: 'Sign In', exact: true }).click();
	await expect(page).toHaveURL(/\/recipes\/signin$/);
	await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
	await expect(page.locator('.site-appbar img')).toHaveAttribute('src', /logo-face\.png/);
	await page.getByRole('textbox', { name: 'Email', exact: true }).fill('theme@example.test');
	await expect(page.getByRole('button', { name: 'Continue', exact: true })).toHaveCSS('background-color', 'rgb(26, 32, 39)');
	await page.locator('.site-footer').getByRole('link', { name: 'Privacy Policy' }).click();
	await expect(page).toHaveURL(/\/privacy-policy$/);
	await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
	await expect(page.locator('.site-footer img')).toHaveAttribute('src', /logo-face\.png/);
});

test('home theme follows a session refresh and keeps the approved branding', async ({ page }) => {
	let signedIn = false;
	await page.route('**/api/auth/session', route => route.fulfill({
		json: signedIn ? {
			user: { name: 'Theme Test', email: 'theme@example.test' },
			expires: '2099-01-01T00:00:00.000Z',
		} : null,
	}));
	await page.goto('/');
	await expect(page.locator('.site-appbar img')).toHaveAttribute('src', /logo-face\.png/);
	const refreshSession = () => page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', {
		key: 'nextauth.message',
		newValue: JSON.stringify({ event: 'session', data: { trigger: 'getSession' } }),
	})));
	signedIn = true;
	await refreshSession();
	await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
	await expect(page.locator('.site-appbar img')).toHaveAttribute('src', /logo-face\.png/);
	await expect(page.locator('.site-appbar').getByTestId('AddCircleIcon')).toBeVisible();
	signedIn = false;
	await refreshSession();
	await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 245, 238)');
	await expect(page.locator('.site-appbar img')).toHaveAttribute('src', /logo-face\.png/);
	await expect(page.locator('.site-appbar').getByTestId('AddCircleIcon')).toHaveCount(0);
});

test('signed-out home shows the recipe proposition and both image slots', async ({ page }) => {
	await page.goto('/');

	const landing = page.getByTestId('welcome-section');
	await expect(landing).toBeVisible();
	await expect(
		landing.getByRole('heading', { level: 1, name: 'Keep all the recipes you love in one place' }),
	).toBeVisible();
	await expect(landing.getByText(/Save recipes from around the web, add your own favourites/)).toBeVisible();
	await expect(landing.getByRole('heading', { name: 'Save from the web' })).toBeVisible();
	await expect(landing.getByRole('heading', { name: 'Add your own' })).toBeVisible();
	await expect(landing.getByRole('heading', { name: 'Share with your people' })).toBeVisible();
	const heroImage = page.getByTestId('landing-hero-image-slot').locator('img');
	await expect(heroImage).toHaveAttribute('src', /images%2Flanding%2Fhero-pasta\.jpg/);
	await expect(heroImage).toHaveAttribute('alt', 'Pesto pasta with tomatoes and greens on a white plate');
	const productImage = page.getByTestId('landing-product-image-slot').locator('img');
	await expect(productImage).toHaveAttribute('src', /images%2Flanding%2Frecipe-preview\.png/);
	await expect(productImage).toHaveAttribute('alt', /ingredients, and method/);
	await expect(page.locator('.site-appbar a[href="/"] img[alt=""]')).toHaveAttribute(
		'src',
		/images%2Fbranding%2Flogo-face\.png/,
	);

	const appBar = page.locator('.site-appbar');
	const footer = page.locator('.site-footer');
	await expect(appBar).toHaveCSS('background-color', 'rgb(248, 245, 238)');
	await expect(appBar).toHaveCSS('box-shadow', 'none');
	await expect(footer).toHaveCSS('background-color', 'rgb(248, 245, 238)');
});

test('logged-out sign-up CTA opens registration directly', async ({ page }) => {
	await page.goto('/');
	const signUp = page.getByTestId('welcome-section').getByRole('link', { name: 'Sign up for free' }).first();
	await expect(signUp).toHaveAttribute('href', '/recipes/register');
	await signUp.click();
	await expect(page).toHaveURL(/\/recipes\/register$/);
	await expect(page.getByLabel('First Name')).toBeVisible();
});

test('landing Sign In action opens the sign-in page', async ({ page }) => {
	await page.goto('/');
	const signIn = page.getByTestId('welcome-section').getByRole('link', { name: 'Sign in', exact: true });
	await expect(signIn).toHaveAttribute('href', '/recipes/signin');
	await signIn.click();
	await expect(page).toHaveURL(/\/recipes\/signin$/);
	await expect(page.getByTestId('signin-page')).toBeVisible();
});

test('home page preserves the signed-in experience', async ({ page }) => {
	await page.goto('/');

	const helloHeading = page.getByRole('heading', { name: /^Hello,\s/i });
	const isLoggedIn = await helloHeading.isVisible().catch(() => false);

	if (isLoggedIn) {
		await expect(helloHeading).toBeVisible();
		await expect(page.getByTestId('welcome-section')).toHaveCount(0);
		await expect(
			page.getByText(/Add your own recipes|Let's get started/i),
		).toBeVisible();
	} else {
		await expect(page.getByTestId('welcome-section')).toBeVisible();
	}
});
