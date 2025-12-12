'use server';

import  connectDB  from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import mongoose from 'mongoose';

async function addBookmark(recipeId) {
	try {
		await connectDB();

		if (!mongoose.Types.ObjectId.isValid(recipeId)) {
			throw new Error(`Invalid recipe ID: ${recipeId}`);
		}

		const sessionUser = await getSessionUser();


		if (!sessionUser?.id) {
			throw new Error('You must be logged in to add a bookmark');
		}

		const user = await User.findById(sessionUser.id);
		if (!user) {
			throw new Error(`User not found with ID: ${sessionUser.id}`);
		}

		if (user.bookmarks.includes(recipeId)) {
			console.log(`Recipe ${recipeId} is already bookmarked`);
			return { success: true, isBookmarked: true };
		}

		user.bookmarks.push(recipeId);
		await user.save();
		console.log(`Recipe ${recipeId} added to bookmarks`);
		return { success: true, isBookmarked: true };
	} catch (error) {
		console.error('Error in addBookmark:', error.message);
		throw new Error('Failed to add bookmark. Please try again.');
	}
}

export default addBookmark;
