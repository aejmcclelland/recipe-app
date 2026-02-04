import { test, expect } from '@playwright/test';

test('home page loads and shows main heading', async ({ page }) => {
	await page.goto('/');

	// Always present
	await expect(
		page.getByRole('heading', { name: /Welcome to Rebekah's Recipes!/i }),
	).toBeVisible();
});

test('home page shows the correct logged-in or logged-out experience', async ({
	page,
}) => {
	await page.goto('/');

	// Your logged-in branches always include "Hello, <firstName>!"
	const helloHeading = page.getByRole('heading', { name: /^Hello,\s/i });

	const isLoggedIn = await helloHeading.isVisible().catch(() => false);

	if (isLoggedIn) {
		// Logged in: should show one of the logged-in experiences
		await expect(helloHeading).toBeVisible();

		// These lines appear in the logged-in branches
		await expect(
			page.getByText(/Add your own recipes|Let's get started/i),
		).toBeVisible();

		// SearchBar only appears when userRecipes.length > 0 (final branch),
		// so we *don't* assert it always.
	} else {
		// Logged out: WelcomeSection renders instead.
		// We need a stable bit of text inside WelcomeSection to assert.
		// For now, assert that the logged-in copy is shown.
		await expect(page.getByTestId('welcome-section')).toBeVisible();
	}
});
