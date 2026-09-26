import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';

// Bundle the real dialog with action doubles. Server authorization is covered
// separately by recipe-detail-access.ts; these tests never touch stored data.
const require = createRequire(import.meta.url);
const { build } = require(require.resolve('esbuild', { paths: [require.resolve('tsx')] })) as {
	build(options: Record<string, unknown>): Promise<{ outputFiles: { text: string }[] }>;
};
let bundle: string;
let errors: string[];
test.use({ viewport: { width: 390, height: 844 } });
test.beforeAll(async () => {
	const result = await build({
		stdin: {
			contents: `import React from 'react'; import { createRoot } from 'react-dom/client';
import RecipeSharing from './components/RecipeSharing';
createRoot(document.getElementById('root')).render(<RecipeSharing recipeId="cccccccccccccccccccccccc" />);`,
			resolveDir: process.cwd(), loader: 'tsx',
		},
		alias: { '@/app/actions/recipeSharing': path.resolve('tests/fixtures/recipe-sharing-actions.ts') },
		bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
		define: { 'process.env.NODE_ENV': '"development"' },
	});
	bundle = result.outputFiles[0].text;
});
test.beforeEach(async ({ page }) => {
	errors = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.route('**/sharing-test.js', route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
	await page.route('**/__sharing_test__', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sharing test</title><body><div id="root"></div><script src="/sharing-test.js"></script></body></html>' }));
	await page.goto('/__sharing_test__');
	await page.getByRole('button', { name: 'Manage sharing', exact: true }).click();
	await expect(page.getByText('This recipe is not shared with anyone.')).toBeVisible();
});
test.afterEach(() => { expect(errors).toEqual([]); });

test('owner can find, share, see existing access and revoke in the dialog', async ({ page }) => {
	const dialog = page.getByRole('dialog', { name: 'Manage sharing' });
	const input = dialog.getByRole('textbox', { name: 'Recipient email' });
	await input.fill(' Recipient@Example.com ');
	await dialog.getByRole('button', { name: 'Find recipient' }).click();
	await expect(dialog.getByRole('status')).toContainText('is registered');
	await dialog.getByRole('button', { name: 'Share recipe', exact: true }).click();
	await expect(dialog.getByRole('status')).toHaveText('Recipe shared successfully.');
	const revoke = dialog.getByRole('button', { name: 'Revoke access for recipient@example.com' });
	await expect(revoke).toBeVisible();
	await dialog.getByRole('button', { name: 'Find recipient' }).click();
	await expect(dialog.getByRole('status')).toContainText('already has access');
	await expect(dialog.getByRole('button', { name: 'Share recipe', exact: true })).toHaveCount(0);
	await revoke.click();
	await expect(dialog.getByRole('status')).toHaveText('Access revoked successfully.');
	await expect(dialog.getByText('This recipe is not shared with anyone.')).toBeVisible();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(dialog).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'Manage sharing', exact: true })).toBeFocused();
});

test('lookup states are accessible and recover after an action failure', async ({ page }) => {
	const dialog = page.getByRole('dialog');
	const input = dialog.getByRole('textbox', { name: 'Recipient email' });
	for (const [email, text] of [
		['partial', 'Enter a complete, valid email address.'],
		['owner@example.com', 'cannot share it with yourself'],
		['unknown@example.com', 'is not registered'],
		['limited@example.com', 'Too many sharing attempts'],
		['failure@example.com', 'We couldn’t complete that request'],
	]) {
		await input.fill(email);
		await dialog.getByRole('button', { name: 'Find recipient' }).click();
		await expect(dialog.locator('.MuiAlert-root')).toContainText(text);
		if (email === 'partial') {
			await expect(input).toHaveAttribute('aria-invalid', 'true');
			await expect(input).toHaveAccessibleDescription('Enter a complete, valid email address.');
		}
		await expect(dialog.getByRole('button', { name: 'Share recipe', exact: true })).toHaveCount(0);
	}
	await expect(dialog).not.toContainText('private server detail');
	await expect(dialog.getByRole('button', { name: 'Send invitation' })).toHaveCount(0);
	await input.fill('recipient@example.com');
	await dialog.getByRole('button', { name: 'Find recipient' }).click();
	await expect(dialog.getByRole('button', { name: 'Share recipe', exact: true })).toBeEnabled();
});
