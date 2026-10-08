import type { Page } from '@playwright/test';

export function collectBrowserErrors(page: Page, browserErrors: string[]) {
	page.on('pageerror', (error) => {
		const message = error.message;

		if (
			message.includes('due to access control checks') &&
			(message.includes('__nextjs_original-stack-frames') ||
				message.includes('/api/auth/session'))
		) {
			return;
		}

		browserErrors.push(message);
	});
}
