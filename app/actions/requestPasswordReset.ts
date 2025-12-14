'use server';

import crypto from 'crypto';
import connectDB from '@/config/database';
import User from '@/models/User';
import { sendMail } from '@/utils/mailer';

function sha256(input: string) {
	return crypto.createHash('sha256').update(input).digest('hex');
}

export async function requestPasswordReset(emailRaw: string) {
	const email = (emailRaw || '').trim().toLowerCase();

	// Always return success (avoid account enumeration)
	if (!email || !email.includes('@')) return { ok: true };

	await connectDB();

	const user = await User.findOne({ email });
	if (!user) return { ok: true };

	const token = crypto.randomBytes(32).toString('hex');
	const tokenHash = sha256(token);

	user.resetPasswordTokenHash = tokenHash;
	user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins
	await user.save();

	const baseUrl =
		process.env.NEXTAUTH_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		'http://localhost:3000';

	const resetUrl = `${baseUrl}/recipes/reset-password?email=${encodeURIComponent(
		email
	)}&token=${token}`;

	await sendMail({
		to: email,
		subject: 'Reset your password',
		text: `Reset your password using this link: ${resetUrl}`,
		html: `
      <p>You requested a password reset for Rebekah’s Recipes.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 30 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    `,
	});

	return { ok: true };
}
