'use server';

import User from '@/models/User';
import dbConnect from '@/config/database';

export default async function registerUser(formData) {
	await dbConnect();
	const { firstName, lastName, email, password } = formData;

	try {
		// Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new Error(
				'This email is already registered. Please log in or use a different email.'
			);
		}

		// Create a new user
		const newUser = new User({
			firstName,
			lastName,
			email,
			...(password && { password }), // Only include password if provided
		});

		await newUser.save();
		return { message: 'User registered successfully' };
	} catch (error) {
		// Log unexpected errors for debugging purposes
		console.error('Registration error:', error);

		// Send a general error message
		throw new Error('An unexpected error occurred. Please try again.');
	}
}
