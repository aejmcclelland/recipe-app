const publicRoutes = new Set([
	'/recipes/signin',
	'/recipes/register',
	'/recipes/forgot-password',
	'/recipes/reset-password',
	'/recipes/verify',
	'/recipes/verify/check-email',
	'/recipes/verify/invalid',
	'/recipes/verify/success',
	'/privacy-policy',
	'/terms-of-service',
]);

export function usesPublicTheme(pathname: string | null, hasSession: boolean) {
	return pathname === '/'
		? !hasSession
		: publicRoutes.has(pathname ?? '');
}

export function usesHomeTheme(pathname: string | null, hasSession: boolean) {
	return pathname === '/' && hasSession;
}

// Match the detail route only, excluding edit and all named recipe routes.
export function usesRecipeDetailTheme(pathname: string | null, hasSession: boolean) {
	return hasSession && /^\/recipes\/[a-f\d]{24}$/i.test(pathname ?? '');
}

export function usesProfileTheme(pathname: string | null, hasSession: boolean) {
	return hasSession && pathname === '/recipes/profile';
}

export function usesImportTheme(pathname: string | null, hasSession: boolean) {
	return hasSession && pathname === '/recipes/copyWeb';
}

export function usesRecipeEditTheme(pathname: string | null, hasSession: boolean) {
	return hasSession && /^\/recipes\/[a-f\d]{24}\/edit$/i.test(pathname ?? '');
}

export function usesRecipeAddTheme(pathname: string | null, hasSession: boolean) {
	return hasSession && pathname === '/recipes/add';
}
