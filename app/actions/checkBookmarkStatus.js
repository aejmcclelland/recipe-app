'use server';

import mongoose from 'mongoose';
import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

async function checkBookmarkStatus(recipeId) {
	try {
		await connectDB();

		// Ensure recipeId is valid
		if (!mongoose.Types.ObjectId.isValid(recipeId)) {
			throw new Error(`Invalid recipe ID: ${recipeId}`);
		}
		const sessionUser = await getSessionUser();
		// Correctly access the user ID
		const userId = sessionUser?.id;
		// Validate session user
		if (!userId) {
			return { success: true, isBookmarked: false }; // Treat as not bookmarked if not logged in
		}
		// Ensure userId is valid
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			throw new Error(`Invalid user ID: ${userId}`);
		}

		const user = await User.findById(userId);
		if (!user) {
			throw new Error(`User not found with ID: ${userId}`);
		}

		const isBookmarked = user.bookmarks.some(
			(id) => id.toString() === recipeId.toString()
		);

		return { success: true, isBookmarked };
	} catch (error) {
		console.error('Error in checkBookmarkStatus:', error.message);
		throw new Error('Failed to check bookmark status. Please try again.');
	}
}

export default checkBookmarkStatus;
