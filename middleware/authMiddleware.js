export function authMiddleware(req) {
	const { headers } = req;
	const host = headers.get('host'); // Get the domain dynamically

	// Use the appropriate URL without modifying process.env directly
	const NEXTAUTH_URL = host.includes('rebekahsrecipes.com')
		? 'https://www.rebekahsrecipes.com'
		: 'https://recipe-app-beta-green.vercel.app';
	// Optionally, add this as a header for downstream usage
	req.headers.set('x-nextauth-url', NEXTAUTH_URL);

	return req;
}
