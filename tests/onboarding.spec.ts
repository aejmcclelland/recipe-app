import { test, expect } from '@playwright/test';

for (const emailSent of [true, false]) {
	test(`verification handoff when initial sending ${emailSent ? 'succeeded' : 'failed'}`, async ({ page }) => {
		const query = new URLSearchParams({ email: ' Cook+Recipes@Example.com ' });
		if (!emailSent) query.set('sent', '0');
		await page.goto(`/recipes/verify/check-email?${query}`);

		const handoff = page.getByTestId('verify-check-email');
		await expect(handoff.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('cook+recipes@example.com');
		await expect(handoff.getByRole('button', { name: 'Resend verification email' })).toBeEnabled();
		if (emailSent) {
			await expect(handoff.getByRole('heading', { name: 'Check your email' })).toBeVisible();
			await expect(handoff.getByText('We’ve sent a verification link to cook+recipes@example.com.')).toBeVisible();
			await expect(handoff.getByText(/check spam or junk/)).toBeVisible();
		} else {
			await expect(handoff.getByRole('heading', { name: 'Verify your email', exact: true })).toBeVisible();
			await expect(handoff.getByText('Your account was created, but we could not send the verification email to cook+recipes@example.com just now.')).toBeVisible();
			await expect(handoff.getByText(/Use the resend button below to try again/)).toBeVisible();
			await expect(handoff.getByText(/We’ve sent/)).toHaveCount(0);
		}
		await expect(handoff.getByRole('link', { name: 'Go to Sign In' })).toHaveAttribute('href', '/recipes/signin');
	});
}

test('verification handoff handles repeated and missing query values', async ({ page }) => {
	await page.goto('/recipes/verify/check-email?email=first%40example.com&email=second%40example.com&sent=0&sent=1');
	await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('first@example.com');
	await expect(page.getByText(/Your account was created, but we could not send/)).toBeVisible();

	await page.goto('/recipes/verify/check-email');
	await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
	await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('');
	await expect(page.getByRole('button', { name: 'Resend verification email' })).toBeDisabled();
});

test.describe('registration', () => {
	test.beforeEach(async ({ page }) => {
		// The session request starts after the client tree hydrates. Wait before typing
		// so this test exercises React validation rather than a pre-hydration submission.
		await Promise.all([
			page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/session'),
			page.goto('/recipes/register'),
		]);
	});

	test('shows the password requirement before submission and links directly to sign-in', async ({ page }) => {
		await expect(page.getByLabel(/^Password/)).toHaveAccessibleDescription('Use at least 8 characters.');
		await expect(page.getByText('Already have an account?')).toBeVisible();
		const signIn = page.getByRole('link', { name: 'Sign in', exact: true });
		await expect(signIn).toHaveAttribute('href', '/recipes/signin');
		await signIn.click();
		await expect(page).toHaveURL(/\/recipes\/signin$/);
		await expect(page.getByTestId('signin-page')).toBeVisible();
	});

	test('keeps password errors associated with their fields and preserves input', async ({ page }) => {
		let actionRequests = 0;
		// Never create accounts or send email during this UI regression test.
		await page.route('**/recipes/register', async route => {
			if (route.request().method() === 'POST') {
				actionRequests++;
				await route.abort();
			} else {
				await route.continue();
			}
		});
		await page.getByLabel('First Name').fill('Recipe');
		await page.getByLabel('Last Name').fill('Tester');
		await page.getByRole('textbox', { name: 'Email', exact: true }).fill('onboarding@example.com');
		const password = page.getByLabel(/^Password/);
		const confirm = page.getByLabel(/^Confirm Password/);
		await password.fill('short');
		await confirm.fill('short');
		await page.getByRole('button', { name: 'Register', exact: true }).click();
		await expect(password).toHaveAccessibleDescription('Password must be at least 8 characters.');
		await expect(password).toHaveAttribute('aria-invalid', 'true');
		await expect(password).toBeFocused();
		await page.clock.install();
		await page.clock.fastForward(5000);
		await expect(password).toHaveAccessibleDescription('Password must be at least 8 characters.');

		await password.fill('eight123');
		await page.getByRole('button', { name: 'Register', exact: true }).click();
		await expect(confirm).toHaveAccessibleDescription('Passwords do not match. Please try again.');
		await expect(confirm).toHaveAttribute('aria-invalid', 'true');
		await expect(confirm).toBeFocused();
		await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('onboarding@example.com');
		await expect(password).toHaveValue('eight123');
		await expect(confirm).toHaveValue('short');
		expect(actionRequests).toBe(0);

		// Exactly eight characters passes local validation; a failed request stays visible.
		await confirm.fill('eight123');
		await page.getByRole('button', { name: 'Register', exact: true }).click();
		const error = page.getByRole('alert').filter({ hasText: 'Unable to register just now. Please try again.' });
		await expect(error).toBeVisible();
		await page.clock.fastForward(5000);
		await expect(error).toBeVisible();
		await expect(confirm).toHaveAttribute('aria-invalid', 'false');
		await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('onboarding@example.com');
		await expect(password).toHaveValue('eight123');
		await expect(page.getByRole('button', { name: 'Register', exact: true })).toBeEnabled();
		await expect(page).toHaveURL(/\/recipes\/register$/);
		expect(actionRequests).toBe(1);
	});
});
