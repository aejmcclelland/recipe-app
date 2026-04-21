'use server';

import User from '@/models/User';
import connectDB from '@/config/database';
import {
	normalizeEmail,
	sendVerificationEmail,
} from '@/utils/emailVerification';

export default async function registerUser(formData) {
	await connectDB();

	try {
		const { firstName, lastName, email, password } = formData;

		const trimmedFirstName = firstName?.trim();
		const trimmedLastName = lastName?.trim();
		const sanitizedEmail = normalizeEmail(email);

		if (!trimmedFirstName || !trimmedLastName) {
			throw new Error('First name and last name are required.');
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(sanitizedEmail)) {
			throw new Error('Invalid email format.');
		}

		if (!password || password.length < 8) {
			throw new Error('Password must be at least 8 characters.');
		}

		const formatName = (name) =>
			name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

		const formattedFirstName = formatName(trimmedFirstName);
		const formattedLastName = formatName(trimmedLastName);

		const existingUser = await User.findOne({ email: sanitizedEmail });
		if (existingUser) {
			return {
				success: false,
				message:
					'Unable to register with that email. Please try again or log in.',
			};
		}

		const newUser = new User({
			firstName: formattedFirstName,
			lastName: formattedLastName,
			email: sanitizedEmail,
			emailVerified: null,
			password,
		});

		await newUser.save();

		let emailSent = true;

		try {
			await sendVerificationEmail({
				userId: newUser._id,
				firstName: formattedFirstName,
				email: sanitizedEmail,
			});
		} catch (emailError) {
			emailSent = false;
			console.error('Verification email failed:', emailError);
		}

		return {
			success: true,
			email: sanitizedEmail,
			emailSent,
			requiresEmailVerification: true,
		};
	} catch (error) {
		console.error('Registration error:', error);

		return {
			success: false,
			message:
				error?.message || 'An unexpected error occurred. Please try again.',
		};
	}
}
