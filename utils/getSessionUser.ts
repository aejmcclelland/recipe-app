import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import type { Session } from 'next-auth';

interface SessionUser {
	user: {
		id: string; // MongoDB _id
		name?: string;
		email?: string;
		image?: string;
	};
}

export const getSessionUser = async () => {
	try {
		const session: Session | null = await getServerSession(authOptions);

		console.log('Retrieved session:', session);

		if (!session || !session.user || !session.user.id) {
			console.warn('Session user or ID missing:', session);
			return null;
		}

		return {
			user: {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email,
				image: session.user.image,
			},
		};
	} catch (error) {
		console.error('Error fetching session:', error.message);
		return null;
	}
};
