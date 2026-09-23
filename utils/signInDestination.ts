// Only return to recipe screens. Authentication/API URLs can restart auth or redirect again.
const recipeDestinations = new Set([
	'/',
	'/recipes',
	'/recipes/add',
	'/recipes/profile',
	'/recipes/copyWeb',
	'/recipes/search-results',
]);

export function getSignInDestination(value: string | null, origin: string): string {
	if (
		!value ||
		value !== value.trim() ||
		value.startsWith('//') ||
		value.includes('\\') ||
		Array.from(value).some(character => character.charCodeAt(0) < 32)
	) return '/';

	try {
		const url = new URL(value, origin);
		if (url.origin !== origin || url.username || url.password) return '/';
		if (
			!recipeDestinations.has(url.pathname) &&
			!/^\/recipes\/[a-f\d]{24}(?:\/edit)?$/i.test(url.pathname)
		) return '/';

		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return '/';
	}
}
