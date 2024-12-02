import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import type { Session } from 'next-auth';

interface SessionUser {
	id: string;
	name?: string;
	email?: string;
	image?: string;
}

export const getSessionUser = async (): Promise<SessionUser | null> => {
	try {
		const session: Session | null = await getServerSession(authOptions);

		 console.log('Retrieved session:', session);

		if (!session || !session.user || !session.user.id) {
			console.warn('Session user or ID missing:', session);
			return null;
		}

		return {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			image: session.user.image,
		};
	} catch (error) {
		console.error('Error fetching session:', error);
		return null;
	}
};
