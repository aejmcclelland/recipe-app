'use server';

import User from '@/models/User';
import dbConnect from '@/config/database';

export default async function registerUser(formData) {
	await dbConnect();
	const { firstName, lastName, email, password } = formData;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) throw new Error('User already exists');

		const newUser = new User({
			firstName,
			lastName,
			email,
			password,
		});

		await newUser.save();
		return { message: 'User registered successfully' };
	} catch (error) {
		console.error('Registration error:', error);
		throw new Error('Error registering user');
	}
}
