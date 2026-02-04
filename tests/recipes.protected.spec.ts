import { test, expect } from '@playwright/test';

test('redirects to sign-in when visiting /recipes while logged out', async ({
	page,
}) => {
	await page.goto('/recipes');
	await expect(page).toHaveURL(/\/recipes\/signin/i);
	await expect(page.getByTestId('signin-page')).toBeVisible();
});
