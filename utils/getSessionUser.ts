import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import connectDB from '@/config/database';
import User from '@/models/User';

type SessionUser = {
	id: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

export const getSessionUser = async (): Promise<SessionUser | null> => {
	try {
		const session: Session | null = await getServerSession();

		if (process.env.NODE_ENV === 'development') {
			console.log('Retrieved session in getSessionUser:', session);
		}

		const email = session?.user?.email;
		if (!email) {
			if (process.env.NODE_ENV === 'development') {
				console.warn('No valid session user found (no email):', session);
			}
			return null;
		}

		await connectDB();

		const normalizedEmail = email.toLowerCase().trim();
		const userDoc = await User.findOne({ email: normalizedEmail });

		if (!userDoc) {
			if (process.env.NODE_ENV === 'development') {
				console.warn('No DB user found for session email:', normalizedEmail);
			}
			return null;
		}

		return {
			id: userDoc._id.toString(),
			name: session.user?.name ?? `${userDoc.firstName} ${userDoc.lastName}`,
			email: userDoc.email,
			image: session.user?.image ?? userDoc.image ?? null,
		};
	} catch (error: any) {
		console.error('Error fetching session:', error.message);
		return null;
	}
};
