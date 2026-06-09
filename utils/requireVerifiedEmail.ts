import 'server-only';

import connectDB from '@/config/database';
import User from '@/models/User';

type SessionUser = {
	id?: string;
} | null;

export class EmailVerificationRequiredError extends Error {
	constructor() {
		super('Please verify your email before saving or importing recipes.');
		this.name = 'EmailVerificationRequiredError';
	}
}

export async function requireVerifiedEmail(sessionUser: SessionUser) {
	if (!sessionUser?.id) {
		throw new Error('You must be logged in to perform this action');
	}

	await connectDB();

	const user = await User.findById(sessionUser.id)
		.select('emailVerified authProvider')
		.lean();

	if (!user?.emailVerified && user?.authProvider !== 'google') {
		throw new EmailVerificationRequiredError();
	}

	return sessionUser as { id: string };
}
