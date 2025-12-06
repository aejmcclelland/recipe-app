import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import type { Session } from 'next-auth';

type SessionUser = {
	id: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
} | null;

export const getSessionUser = async (): Promise<SessionUser> => {
	try {
		const session: Session | null = await getServerSession(authOptions);
		if (process.env.NODE_ENV === 'development') {
			console.log('🔍 Retrieved session in getSessionUser:', session);
		}

		if (!session?.user?.id) {
			if (process.env.NODE_ENV === 'development') {
				console.warn('No valid session user found:', session);
			}
			return null;
		}

		return {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			image: session.user.image,
		};
	} catch (error: any) {
		console.error('Error fetching session:', error.message);
		return null;
	}
};
