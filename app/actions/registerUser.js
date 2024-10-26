'use server';

import User from '@/models/User';
import dbConnect from '@/config/database';

export async function POST(req) {
	await dbConnect();
	const { firstName, lastName, email, password } = await req.json();

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return new Response(JSON.stringify({ error: 'User already exists' }), {
				status: 400,
			});
		}

		const newUser = new User({
			firstName,
			lastName,
			email,
			password, // Will be hashed by the pre-save middleware
		});

		await newUser.save();
		return new Response(
			JSON.stringify({ message: 'User registered successfully' }),
			{ status: 201 }
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Error registering user' }), {
			status: 500,
		});
	}
}
