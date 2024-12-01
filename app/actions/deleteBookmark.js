'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

async function deleteBookmark(recipeId) {
	await connectDB();

	const sessionUser = await getSessionUser();

	if (!sessionUser || !sessionUser.user?.id) {
		throw new Error('You must be logged in to remove a bookmark');
	}

	const user = await User.findById(sessionUser.user?.id);

	if (!user) {
		throw new Error('User not found');
	}

	const isBookmarked = user.bookmarks.includes(recipeId);

	if (isBookmarked) {
		user.bookmarks.pull(recipeId); // Remove the recipe from bookmarks
		await user.save();
		console.log(`Recipe ${recipeId} removed from bookmarks`);
		return {
			success: true,
			message: 'Recipe successfully removed from bookmarks',
		};
	}

	throw new Error('Recipe is not currently bookmarked, cannot remove.');
}

export default deleteBookmark;
