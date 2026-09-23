import { test, expect, type Page, type Route } from '@playwright/test';

const requestPath = '/recipes/forgot-password';
const resetPath = '/recipes/reset-password';
const resetLink = `${resetPath}?email=cook%40example.com&token=test-token`;
type ActionResult = { ok: true } | { ok: false; error: string };

// Mock only action responses. No real passwords, accounts or emails are changed.
// Next's Flight envelope carries the action result without replacing the page tree.
async function actionResult(route: Route, result: ActionResult) {
	await route.fulfill({
		contentType: 'text/x-component',
		body: `0:{"a":"$@1","f":""}\n1:${JSON.stringify(result)}\n`,
	});
}

async function interceptAction(page: Page, path: string, handle: (route: Route) => Promise<void>) {
	await page.route(`**${path}*`, async route => {
		if (route.request().method() === 'POST') await handle(route);
		else await route.continue();
	});
}

async function openRequest(page: Page) {
	await Promise.all([
		page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/session'),
		page.goto(requestPath),
	]);
	await page.getByRole('textbox', { name: 'Email', exact: true }).fill('cook@example.com');
}

async function openReset(page: Page) {
	await Promise.all([
		page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/session'),
		page.goto(resetLink),
	]);
	await page.getByLabel('New password', { exact: true }).fill('test-password');
	await page.getByLabel('Confirm new password', { exact: true }).fill('test-password');
}

test('accepted request replaces the form with persistent neutral confirmation and deliberate resend', async ({ page }) => {
	let requests = 0;
	await interceptAction(page, requestPath, async route => {
		requests++;
		expect(JSON.parse(route.request().postData()!)).toEqual(['cook@example.com']);
		await actionResult(route, { ok: true });
	});
	await openRequest(page);
	await page.getByRole('button', { name: 'Send reset link', exact: true }).click();
	const heading = page.getByRole('heading', { name: 'Check your email' });
	await expect(heading).toBeFocused();
	await expect(page.getByRole('status')).toContainText('If an account exists for that email address');
	await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveCount(0);
	await page.clock.install();
	await page.clock.fastForward(10000);
	await expect(heading).toBeVisible();
	await expect(page).toHaveURL(new RegExp(`${requestPath}$`));
	await page.getByRole('button', { name: 'Send another link' }).click();
	const email = page.getByRole('textbox', { name: 'Email', exact: true });
	await expect(email).toHaveValue('cook@example.com');
	await expect(email).toBeFocused();
	expect(requests).toBe(1); // Opening the form never sends another request.
	await page.getByRole('button', { name: 'Send reset link', exact: true }).click();
	await expect(heading).toBeVisible();
	expect(requests).toBe(2);
	await page.getByRole('link', { name: 'Back to sign in' }).click();
	await expect(page).toHaveURL(/\/recipes\/signin$/);
	await expect(page.getByTestId('signin-page')).toBeVisible();
});

for (const failure of ['UNAVAILABLE', 'RATE_LIMITED', 'network', 'server']) {
	test(`request ${failure} failure recovers pending state and allows retry without false success`, async ({ page }) => {
		let requests = 0;
		let release: () => void = () => {};
		const gate = new Promise<void>(resolve => { release = resolve; });
		await interceptAction(page, requestPath, async route => {
			requests++;
			if (requests > 1) return actionResult(route, { ok: true });
			await gate;
			if (failure === 'network') await route.abort('failed');
			else if (failure === 'server') await route.fulfill({ status: 500, contentType: 'text/plain', body: 'private provider credentials and database details' });
			else await actionResult(route, { ok: false, error: failure });
		});
		await openRequest(page);
		await page.getByRole('button', { name: 'Send reset link', exact: true }).click();
		const form = page.getByTestId('forgot-password-page');
		const email = page.getByRole('textbox', { name: 'Email', exact: true });
		await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
		await expect(email).toBeDisabled();
		await page.keyboard.press('Enter');
		await expect.poll(() => requests).toBe(1);
		release();
		await expect(form.getByRole('alert')).toContainText(failure === 'RATE_LIMITED' ? 'Too many requests.' : 'We couldn’t process your request right now.');
		await expect(form.getByRole('alert')).not.toContainText('private');
		await expect(page.getByRole('heading', { name: 'Check your email' })).toHaveCount(0);
		await expect(email).toBeEnabled();
		await expect(email).toHaveValue('cook@example.com');
		await expect(page.getByRole('button', { name: 'Send reset link', exact: true })).toBeEnabled();
		await page.clock.install();
		await page.clock.fastForward(10000);
		await expect(form.getByRole('alert')).toBeVisible();
		await page.getByRole('button', { name: 'Send reset link', exact: true }).click();
		await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
		expect(requests).toBe(2);
	});
}

for (const query of ['', '?email=cook%40example.com', '?token=test-token', '?email=%20&token=%20']) {
	test(`missing reset parameters show recovery instead of a password form: ${query}`, async ({ page }) => {
		await page.goto(`${resetPath}${query}`);
		const form = page.getByTestId('reset-password-page');
		await expect(form.getByRole('alert')).toContainText('You need a valid password-reset link');
		await expect(page.getByLabel('New password', { exact: true })).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Request a new reset link' })).toHaveAttribute('href', requestPath);
		await page.getByRole('link', { name: 'Request a new reset link' }).click();
		await expect(page.getByRole('button', { name: 'Send reset link', exact: true })).toBeVisible();
	});
}

test('invalid, expired or used link result removes the form and provides persistent recovery', async ({ page }) => {
	await interceptAction(page, resetPath, route => actionResult(route, { ok: false, error: 'INVALID_LINK' }));
	await openReset(page);
	await page.getByRole('button', { name: 'Update password' }).click();
	const form = page.getByTestId('reset-password-page');
	await expect(form.getByRole('alert')).toHaveText('This password-reset link is no longer valid. Please request a new link.');
	await expect(page.getByLabel('New password', { exact: true })).toHaveCount(0);
	await page.clock.install();
	await page.clock.fastForward(10000);
	await expect(form.getByRole('alert')).toBeVisible();
	await page.getByRole('link', { name: 'Request a new reset link' }).click();
	await expect(page).toHaveURL(new RegExp(`${requestPath}$`));
});

for (const failure of ['UNAVAILABLE', 'RATE_LIMITED', 'network']) {
	test(`password update ${failure} failure recovers controls and successful retry still reaches sign-in`, async ({ page }) => {
		let requests = 0;
		let release: () => void = () => {};
		const gate = new Promise<void>(resolve => { release = resolve; });
		await interceptAction(page, resetPath, async route => {
			requests++;
			if (requests > 1) return actionResult(route, { ok: true });
			await gate;
			if (failure === 'network') await route.abort('failed');
			else await actionResult(route, { ok: false, error: failure });
		});
		await openReset(page);
		await page.getByRole('button', { name: 'Update password' }).click();
		await expect(page.getByRole('button', { name: 'Updating…' })).toBeDisabled();
		await expect(page.getByLabel('New password', { exact: true })).toBeDisabled();
		await page.keyboard.press('Enter');
		await expect.poll(() => requests).toBe(1);
		release();
		await expect(page.getByTestId('reset-password-page').getByRole('alert')).toContainText(failure === 'RATE_LIMITED' ? 'Too many attempts.' : 'We couldn’t update your password right now.');
		await expect(page.getByLabel('New password', { exact: true })).toHaveValue('test-password');
		await expect(page.getByRole('button', { name: 'Update password' })).toBeEnabled();
		await page.getByRole('button', { name: 'Update password' }).click();
		await expect(page).toHaveURL(/\/recipes\/signin$/);
		await expect(page.getByTestId('signin-page')).toBeVisible();
		expect(requests).toBe(2);
	});
}

test('password validation stays visible and does not submit invalid input', async ({ page }) => {
	let requests = 0;
	await interceptAction(page, resetPath, async route => { requests++; await route.abort(); });
	await openReset(page);
	const password = page.getByLabel('New password', { exact: true });
	const confirm = page.getByLabel('Confirm new password', { exact: true });
	await password.fill('short');
	await page.getByRole('button', { name: 'Update password' }).click();
	await expect(password).toHaveAccessibleDescription('Password must be at least 8 characters.');
	await password.fill('different-password');
	await page.getByRole('button', { name: 'Update password' }).click();
	await expect(confirm).toHaveAccessibleDescription('Passwords do not match.');
	expect(requests).toBe(0);
});
