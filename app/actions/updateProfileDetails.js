'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

export default async function updateProfileDetails({
	email,
	firstName,
	lastName,
}) {
	await connectDB();

	const sessionUser = await getSessionUser();

	if (!sessionUser || !sessionUser.id) {
		throw new Error('You must be logged in to update your profile details.');
	}

	const userId = sessionUser.id;

	const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ email, firstName, lastName },
		{ new: true }
	);

	if (!updatedUser) {
		throw new Error('User not found.');
	}

	return {
		success: true,
		user: {
			id: updatedUser._id.toString(),
			email: updatedUser.email,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
		},
	};
}
