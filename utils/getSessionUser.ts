import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import type { Session } from 'next-auth';

export const getSessionUser = async () => {
	try {
		const session: Session | null = await getServerSession(authOptions);
		console.log('🔍 Retrieved session in getSessionUser:', session);

		if (!session || !session.user || !session.user.id) {
			console.warn('No valid session user found:', session);
			return null;
		}

		const sessionUser = {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			image: session.user.image,
		};

		console.log('getSessionUser is returning:', sessionUser);
		return sessionUser;
	} catch (error) {
		console.error('Error fetching session:', error.message);
		return null;
	}
};
