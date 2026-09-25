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

		// JWT/session callbacks preserve this database ID across client updates.
		// Email is editable session metadata and must never select the account.
		const userId = session?.user?.id;
		if (typeof userId !== 'string' || !/^[a-f\d]{24}$/i.test(userId)) return null;

		await connectDB();

		const userDoc = await User.findById(userId)
			.select('_id firstName lastName email image')
			.lean();

		if (!userDoc) return null;

		return {
			id: userDoc._id.toHexString(),
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
