import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import connectDB from '@/config/database';
import User from '@/models/User';
import { authOptions } from '@/utils/authOptions';

type SessionUser = {
	id: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

export const getSessionUser = async (): Promise<SessionUser | null> => {
	try {
		const session: Session | null = await getServerSession(authOptions);

		const email = session?.user?.email;
		if (!email) return null;

		await connectDB();

		const normalizedEmail = email.toLowerCase().trim();
		const userDoc = await User.findOne({ email: normalizedEmail })
			.select('_id firstName lastName email image')
			.lean();

		if (!userDoc) return null;

		return {
			id: userDoc._id.toString(),
			name: session.user?.name ?? `${userDoc.firstName} ${userDoc.lastName}`,
			email: userDoc.email,
			image: session.user?.image ?? userDoc.image ?? null,
		};
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error fetching session:', error);
		}
		return null;
	}
};
