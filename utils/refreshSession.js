import { getSession, signOut } from 'next-auth/react';

export const refreshSession = async () => {
	const session = await getSession();
	if (!session) return; // Exit early if no user session

	await signOut({ callbackUrl: '/recipes/signin' });
};
