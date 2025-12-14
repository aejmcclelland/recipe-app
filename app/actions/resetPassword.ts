'use server';

import crypto from 'crypto';
import connectDB from '@/config/database';
import User from '@/models/User';

function sha256(input: string) {
	return crypto.createHash('sha256').update(input).digest('hex');
}

export async function resetPassword(params: {
	email: string;
	token: string;
	password: string;
}) {
	const email = (params.email || '').trim().toLowerCase();
	const token = (params.token || '').trim();
	const password = params.password || '';

	if (!email || !email.includes('@') || !token || password.length < 8) {
		throw new Error('Invalid password reset request.');
	}

	await connectDB();

	const tokenHash = sha256(token);

	const user = await User.findOne({
		email,
		resetPasswordTokenHash: tokenHash,
		resetPasswordExpires: { $gt: new Date() },
	});

	if (!user) {
		throw new Error('This reset link is invalid or has expired.');
	}

	user.password = password; // your pre-save hook hashes it
	user.resetPasswordTokenHash = null as any;
	user.resetPasswordExpires = null as any;

	await user.save();

	return { ok: true };
}
