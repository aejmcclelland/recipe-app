'use server';

import crypto from 'crypto';
import connectDB from '@/config/database';
import User from '@/models/User';
import { sendMail } from '@/utils/mailer';
import { enforceRateLimit, getRequestIp, RateLimitError } from '@/utils/rateLimit';

function sha256(input: string) {
	return crypto.createHash('sha256').update(input).digest('hex');
}

type PasswordResetRequestResult =
	| { ok: true }
	| { ok: false; error: 'RATE_LIMITED' | 'UNAVAILABLE' };

export async function requestPasswordReset(emailRaw: string): Promise<PasswordResetRequestResult> {
	try {
		await enforceRateLimit('password-reset', await getRequestIp());

		const email = (emailRaw || '').trim().toLowerCase();

		// Keep the normal response identical for known and unknown emails.
		if (!email || !email.includes('@')) return { ok: true };

		await connectDB();

		const user = await User.findOne({ email });
		if (!user) return { ok: true };

		// Everything after the account lookup is account-dependent. Do not expose
		// delivery or save failures here: that would turn outages into an account probe.
		try {
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
		} catch {
			console.error('Password-reset email could not be prepared or sent.');
		}

		return { ok: true };
	} catch (error) {
		// Request-wide failures are safe to report, regardless of account existence.
		return { ok: false, error: error instanceof RateLimitError ? 'RATE_LIMITED' : 'UNAVAILABLE' };
	}
}
