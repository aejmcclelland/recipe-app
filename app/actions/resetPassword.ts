'use server';

import crypto from 'crypto';
import connectDB from '@/config/database';
import User from '@/models/User';
import { enforceRateLimit, getRequestIp, RateLimitError } from '@/utils/rateLimit';

function sha256(input: string) {
	return crypto.createHash('sha256').update(input).digest('hex');
}

type ResetPasswordResult =
	| { ok: true }
	| { ok: false; error: 'INVALID_LINK' | 'INVALID_PASSWORD' | 'RATE_LIMITED' | 'UNAVAILABLE' };

export async function resetPassword(params: {
	email: string;
	token: string;
	password: string;
}): Promise<ResetPasswordResult> {
	try {
		await enforceRateLimit('password-reset', await getRequestIp());

		const email = (params.email || '').trim().toLowerCase();
		const token = (params.token || '').trim();
		const password = params.password || '';

		if (!email || !email.includes('@') || !token) {
			return { ok: false, error: 'INVALID_LINK' };
		}
		if (password.length < 8) {
			return { ok: false, error: 'INVALID_PASSWORD' };
		}

		await connectDB();

		const tokenHash = sha256(token);

		const user = await User.findOne({
			email,
			resetPasswordTokenHash: tokenHash,
			resetPasswordExpires: { $gt: new Date() },
		});

		if (!user) {
			return { ok: false, error: 'INVALID_LINK' };
		}

		user.password = password; // your pre-save hook hashes it
		user.resetPasswordTokenHash = null;
		user.resetPasswordExpires = null;

		await user.save();

		return { ok: true };
	} catch (error) {
		return { ok: false, error: error instanceof RateLimitError ? 'RATE_LIMITED' : 'UNAVAILABLE' };
	}
}
