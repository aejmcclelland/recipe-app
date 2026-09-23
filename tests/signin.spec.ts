import { test, expect, type Page } from '@playwright/test';
import { getSignInDestination } from '../utils/signInDestination';

const providers = {
	google: { id: 'google', name: 'Google', type: 'oauth' },
	credentials: { id: 'credentials', name: 'Credentials', type: 'credentials' },
};

// Exercise the real NextAuth browser client without authenticating real accounts.
test.beforeEach(async ({ page }) => {
	await page.route('**/api/auth/**', async route => {
		const path = new URL(route.request().url()).pathname;
		if (path === '/api/auth/providers') await route.fulfill({ json: providers });
		else if (path === '/api/auth/csrf') await route.fulfill({ json: { csrfToken: 'test-csrf' } });
		else if (path === '/api/auth/session') await route.fulfill({ json: {} });
		else await route.abort();
	});
});

async function passwordStep(page: Page) {
	await page.getByRole('textbox', { name: 'Email', exact: true }).fill('cook@example.com');
	await page.getByRole('button', { name: 'Continue', exact: true }).click();
	return page.getByLabel(/^Password/);
}

test('email stays visible and can be corrected with keyboard focus restored', async ({ page }) => {
	await page.goto('/recipes/signin');
	const password = await passwordStep(page);
	await expect(password).toBeFocused();
	await expect(page.getByText('Signing in as cook@example.com')).toBeVisible();
	await password.fill('test-password');
	await expect(page.getByRole('link', { name: 'Forgotten your password?' })).toHaveAttribute('href', '/recipes/forgot-password');
	await page.getByRole('button', { name: 'Change email' }).click();
	const email = page.getByRole('textbox', { name: 'Email', exact: true });
	await expect(email).toBeFocused();
	await expect(email).toHaveValue('cook@example.com');
	await email.fill('corrected@example.com');
	await page.getByRole('button', { name: 'Continue', exact: true }).click();
	await expect(password).toBeFocused();
	await expect(password).toHaveValue('');
	await expect(page.getByText('Signing in as corrected@example.com')).toBeVisible();
});

for (const [code, message] of [
	['OAuthCallback', 'Google sign-in wasn’t completed.'],
	['OAuthAccountNotLinked', 'Try the sign-in method you originally used'],
	['account_exists', 'Try the sign-in method you originally used'],
	['CredentialsSignin', 'Invalid email or password.'],
	['SessionRequired', 'Please sign in to continue to that page.'],
	['unexpected_internal_database_error', 'We couldn’t sign you in just now.'],
]) {
	test(`persistent, safe feedback for ${code}`, async ({ page }) => {
		await page.goto(`/recipes/signin?error=${code}`);
		await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
		await expect(page.getByTestId('signin-page').getByRole('alert')).toContainText(message);
		await page.clock.install();
		await page.clock.fastForward(5000);
		await expect(page.getByTestId('signin-page').getByRole('alert')).toContainText(message);
		await expect(page.getByTestId('signin-page').getByRole('alert')).not.toContainText(code);
	});
}

test('provider-loading failure has a working retry action', async ({ page }) => {
	let unavailable = true;
	await page.route('**/api/auth/providers', route => route.fulfill({
		status: unavailable ? 503 : 200,
		json: unavailable ? null : providers,
	}));
	await page.goto('/recipes/signin');
	await expect(page.getByTestId('signin-page').getByRole('alert')).toContainText('We couldn’t load the sign-in options.');
	unavailable = false;
	await page.getByRole('button', { name: 'Try again' }).click();
	await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
	await expect(page.getByTestId('signin-page').getByRole('alert')).toHaveCount(0);
});

for (const [status, code, message] of [
	[401, 'CredentialsSignin', 'Invalid email or password.'],
	[200, 'CredentialsSignin', 'Invalid email or password.'],
	[429, 'RATE_LIMITED', 'Too many sign-in attempts.'],
	[503, 'SERVICE_UNAVAILABLE', 'Sign-in is temporarily unavailable.'],
] as const) {
	test(`credentials ${status}/${code} stays on sign-in and allows retry`, async ({ page, baseURL }) => {
		await page.route('**/api/auth/callback/credentials', route => route.fulfill({
			status, json: { url: `${baseURL}/api/auth/error?error=${code}` },
		}));
		await page.goto('/recipes/signin');
		await (await passwordStep(page)).fill('test-password');
		await page.getByRole('button', { name: 'Sign in', exact: true }).click();
		await expect(page.getByTestId('signin-page').getByRole('alert')).toContainText(message);
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
		await expect(page).toHaveURL(/\/recipes\/signin$/);
	});
}

test('rejected credentials request clears pending state and preserves input', async ({ page }) => {
	let release: () => void = () => {};
	const gate = new Promise<void>(resolve => { release = resolve; });
	await page.route('**/api/auth/callback/credentials', async route => {
		await gate;
		await route.abort('failed');
	});
	await page.goto('/recipes/signin');
	const password = await passwordStep(page);
	await password.fill('test-password');
	await page.getByRole('button', { name: 'Sign in', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
	await expect(page.getByRole('button', { name: 'Change email' })).toBeDisabled();
	release();
	await expect(page.getByTestId('signin-page').getByRole('alert')).toContainText('We couldn’t connect to sign you in.');
	await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
	await expect(page.getByRole('button', { name: 'Change email' })).toBeEnabled();
	await expect(password).toHaveValue('test-password');
});

for (const intended of [null, '/recipes/add', 'https://untrusted.example/']) {
	test(`Google submits a safe callback and recovers from a rejected request: ${intended}`, async ({ page }) => {
		let callback = '';
		await page.route('**/api/auth/signin/google', async route => {
			callback = new URLSearchParams(route.request().postData() || '').get('callbackUrl') || '';
			await route.abort('failed');
		});
		await page.goto(`/recipes/signin${intended ? `?callbackUrl=${encodeURIComponent(intended)}` : ''}`);
		const google = page.getByRole('button', { name: 'Continue with Google' });
		await google.click();
		await expect(page.getByTestId('signin-page').getByRole('alert')).toContainText('There was an issue with Google Sign-In.');
		await expect(google).toBeEnabled();
		expect(callback).toBe(intended === '/recipes/add' ? intended : '/');
	});
}

for (const intended of [null, '/recipes/add?from=signin', 'same-origin', 'https://untrusted.example/']) {
	test(`credentials navigate to validated destination: ${intended}`, async ({ page, baseURL }) => {
		const requested = intended === 'same-origin' ? `${baseURL}/recipes/profile` : intended;
		const expected = intended === 'same-origin' ? '/recipes/profile' : intended?.startsWith('/') ? intended : '/';
		let callback = '';
		await page.route('**/api/auth/callback/credentials', async route => {
			callback = new URLSearchParams(route.request().postData() || '').get('callbackUrl') || '';
			// Deliberately untrusted response URL: the component must ignore it.
			await route.fulfill({ json: { url: 'https://untrusted.example/' } });
		});
		// Stub only the landing document: no real session or protected data is accessed.
		await page.route('**/*', async route => {
			const request = route.request();
			const url = new URL(request.url());
			if (request.isNavigationRequest() && `${url.pathname}${url.search}` === expected) {
				await route.fulfill({ contentType: 'text/html', body: '<h1>Test destination</h1>' });
			} else await route.fallback();
		});
		await page.goto(`/recipes/signin${requested ? `?callbackUrl=${encodeURIComponent(requested)}` : ''}`);
		await (await passwordStep(page)).fill('test-password');
		await page.getByRole('button', { name: 'Sign in', exact: true }).click();
		await expect(page).toHaveURL(`${baseURL}${expected}`);
		await expect(page.getByRole('heading', { name: 'Test destination' })).toBeVisible();
		expect(callback).toBe(expected);
	});
}

test('protected-route middleware supplies the intended application destination', async ({ page, baseURL }) => {
	await page.goto('/recipes/add');
	await expect(page).toHaveURL(/\/recipes\/signin\?/);
	const callback = new URL(page.url()).searchParams.get('callbackUrl');
	expect(getSignInDestination(callback, new URL(baseURL!).origin)).toBe('/recipes/add');
});

test('destination validation rejects unsafe URLs and authentication loops', () => {
	const origin = 'https://www.rebekahsrecipes.com';
	for (const value of [
		null, '', 'https://untrusted.example/recipes/add', '//untrusted.example/recipes/add',
		'//www.rebekahsrecipes.com/recipes/add', '/\\untrusted.example',
		'javascript:alert(1)', 'data:text/html,test', 'https://www.rebekahsrecipes.com.untrusted.example/recipes/add',
		'https://user@www.rebekahsrecipes.com/recipes/add', 'http://www.rebekahsrecipes.com/recipes/add',
		'https://www.rebekahsrecipes.com:444/recipes/add', '/%2f%2funtrusted.example',
		'/recipes/signin?callbackUrl=/recipes/add', '/api/auth/signout', '/recipes/register',
		'/recipes/verify', '/recipes/forgot-password', '/recipes/reset-password',
		' /recipes/add', '/recipes/\nadd', 'https://[invalid',
	]) expect(getSignInDestination(value, origin), String(value)).toBe('/');
	const edit = '/recipes/507f1f77bcf86cd799439011/edit?from=home#ingredients';
	expect(getSignInDestination(edit, origin)).toBe(edit);
	expect(getSignInDestination(`${origin}${edit}`, origin)).toBe(edit);
});
