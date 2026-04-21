// app/actions/resendVerificationEmail.ts
'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { normalizeEmail, sendVerificationEmail } from '@/utils/emailVerification';

type ResendVerificationResult = {
	ok: true;
};

export async function resendVerificationEmail(
	emailRaw: unknown
): Promise<ResendVerificationResult> {
	await connectDB();

	const email = normalizeEmail(emailRaw);

	// Always return ok (prevents account enumeration)
	if (!email || !email.includes('@')) return { ok: true };

	const user = await User.findOne({ email }).select(
		'_id email firstName emailVerified'
	);
	if (!user) return { ok: true };
	if (user.emailVerified) return { ok: true };

	try {
		await sendVerificationEmail({
			userId: user._id,
			firstName: user.firstName,
			email: user.email,
		});
	} catch (err) {
		console.error('Resend verification email failed:', err);
	}

	return { ok: true };
}
