import { signIn, signOut } from 'next-auth/react';

export const refreshSession = async () => {
	await signOut({ redirect: false }); // Sign out without redirecting
	await signIn('credentials', { redirect: false }); // Re-sign in the user
};
