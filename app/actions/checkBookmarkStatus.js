'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

async function checkBookmarkStatus(recipeId) {
	try {
		await connectDB();

		if (!recipeId) {
			throw new Error('Recipe ID is missing or invalid');
		}

		const sessionUser = await getSessionUser();

		if (!sessionUser || !sessionUser.id) {
			throw new Error('You must be logged in to check bookmark status');
		}

		const userId = sessionUser.id;
		const user = await User.findById(userId);
		if (!user) {
			throw new Error(`User not found with ID: ${userId}`);
		}

		const isBookmarked = user.bookmarks.includes(recipeId.toString());
		
		return { success: true, isBookmarked };
	} catch (error) {
		console.error('Error in checkBookmarkStatus:', error.message);
		throw new Error('Failed to check bookmark status. Please try again.');
	}
}

export default checkBookmarkStatus;
