export function authMiddleware(req) {
	const { headers } = req;
	const host = headers.get('host'); // Get the domain dynamically
	const NEXTAUTH_URL = host.includes('rebekahsrecipes.com')
		? 'https://www.rebekahsrecipes.com'
		: 'https://recipe-app-beta-green.vercel.app';

	process.env.NEXTAUTH_URL = NEXTAUTH_URL;
}
