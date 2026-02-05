'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import Recipe from '@/models/Recipe';      
import Bookmark from '@/models/User';  

export async function deleteAccount() {
	await connectDB();

	const sessionUser = await getSessionUser();

	if (!sessionUser || !sessionUser.id) {
		throw new Error('You must be logged in to delete your account.');
	}

	const userId = sessionUser.id;

	// cascade delete user-owned data
	await Recipe.deleteMany({ user: userId });
	await Bookmark.deleteMany({ user: userId });

	const deletedUser = await User.findByIdAndDelete(userId);

	if (!deletedUser) {
		throw new Error('User not found.');
	}

	return { success: true };
}
