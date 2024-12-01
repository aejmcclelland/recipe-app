import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import { Session } from 'next-auth';

// Define the structure of the returned session user
interface SessionUser {
	user: {
		id?: string; // Add other properties as required (e.g., email, name, etc.)
		name?: string;
		email?: string;
		image?: string;
	};
	userId?: string;
}

export const getSessionUser = async (): Promise<SessionUser | null> => {
	const session: Session | null = await getServerSession(authOptions);

	if (!session || !session.user) {
		return null;
	}

	return {
		id: session.user.id,
		email: session.user.email,
		name: session.user.name,
		image: session.user.image,
	};
};
