'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

async function addBookmark(recipeId) {
	await connectDB();

	const sessionUser = await getSessionUser();
	if (!sessionUser || !sessionUser.user?.id) {
		throw new Error('You must be logged in to add a bookmark');
	}

	const user = await User.findById(sessionUser.user?.id);

	if (!user) {
		throw new Error('User not found');
	}

	const isAlreadyBookmarked = user.bookmarks.includes(recipeId);

	if (isAlreadyBookmarked) {
		console.log(`Recipe ${recipeId} is already bookmarked`);
		return { success: true, isBookmarked: true }; // Gracefully return
	}

	user.bookmarks.push(recipeId); // Add the recipe to bookmarks
	await user.save();
	console.log(`Recipe ${recipeId} added to bookmarks`);
	return { success: true, isBookmarked: true }; // Return success
}

export default addBookmark;
