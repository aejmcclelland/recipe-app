'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import mongoose from 'mongoose';

async function deleteBookmark(recipeId) {
	try {
		// Connect to the database
		await connectDB();

		// Validate the recipeId format
		if (!mongoose.Types.ObjectId.isValid(recipeId)) {
			throw new Error(`Invalid recipe ID: ${recipeId}`);
		}

		// Retrieve the session user
		const sessionUser = await getSessionUser();
		if (!sessionUser || !sessionUser.user?.id) {
			throw new Error('You must be logged in to remove a bookmark');
		}

		const userId = sessionUser.user.id;
		console.log(`Logged-in user ID: ${userId}`); // Debugging

		// Find the user in the database
		const user = await User.findById(userId);
		if (!user) {
			throw new Error(`User not found with ID: ${userId}`);
		}

		// Check if the recipe is bookmarked
		const isBookmarked = user.bookmarks.includes(recipeId);
		console.log(`Is recipe ${recipeId} bookmarked:`, isBookmarked);

		if (isBookmarked) {
			// Remove the recipe from the bookmarks array
			user.bookmarks.pull(recipeId);
			await user.save();
			console.log(
				`Recipe ${recipeId} removed from bookmarks for user ${userId}`
			);
			return {
				success: true,
				message: 'Recipe successfully removed from bookmarks',
			};
		}

		throw new Error('Recipe is not currently bookmarked, cannot remove.');
	} catch (error) {
		console.error('Error in deleteBookmark:', error.message);
		throw new Error('Failed to remove bookmark. Please try again.');
	}
}

export default deleteBookmark;
