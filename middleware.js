import { withAuth } from 'next-auth/middleware';

export default withAuth({
	pages: {
		signIn: '/recipes/signin', // Redirect to this page if not authenticated
	},
});

export const config = {
	matcher: [
		'/recipes/add',
		'/recipes/:id/edit',
		'/recipes/profile',
		'/recipes/:id',
	],
};
