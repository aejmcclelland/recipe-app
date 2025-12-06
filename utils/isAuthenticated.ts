import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import type { Session } from 'next-auth';

export const isAuthenticated = async () => {
	const session: Session | null = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	return {
		id: session.user.id,
		name: session.user.name,
		email: session.user.email,
		image: session.user.image,
	};
};
