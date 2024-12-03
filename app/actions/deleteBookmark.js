'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import mongoose from 'mongoose';

async function deleteBookmark(recipeId) {
	try {
		await connectDB();

		if (!mongoose.Types.ObjectId.isValid(recipeId)) {
			throw new Error(`Invalid recipe ID: ${recipeId}`);
		}

		const sessionUser = await getSessionUser();
		console.log('Session user in deleteBookmark:', sessionUser);

		if (!sessionUser?.id) {
			throw new Error('You must be logged in to remove a bookmark');
		}

		const user = await User.findById(sessionUser.id);
		if (!user) {
			throw new Error(`User not found with ID: ${sessionUser.id}`);
		}

		if (!user.bookmarks.includes(recipeId)) {
			throw new Error(`Recipe ${recipeId} is not bookmarked`);
		}

		user.bookmarks.pull(recipeId);
		await user.save();
		console.log(`Recipe ${recipeId} removed from bookmarks`);
		return { success: true, message: 'Bookmark removed successfully' };
	} catch (error) {
		console.error('Error in deleteBookmark:', error.message);
		throw new Error('Failed to remove bookmark. Please try again.');
	}
}

export default deleteBookmark;
