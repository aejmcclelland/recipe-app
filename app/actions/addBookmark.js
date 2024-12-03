'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import mongoose from 'mongoose';

async function addBookmark(recipeId) {
	try {
		console.log('Recipe ID received in addBookmark:', recipeId);

		const sessionUser = await getSessionUser();
		console.log('Session user in addBookmark:', sessionUser);

		if (!sessionUser || !sessionUser.id) {
			console.error('Session user not found or missing ID');
			throw new Error('You must be logged in to add a bookmark');
		}

		const user = await User.findById(sessionUser.id);
		console.log('User found in addBookmark:', user);

		if (!user) {
			console.error('User not found in database');
			throw new Error('User not found');
		}

		const isAlreadyBookmarked = user.bookmarks.includes(recipeId);
		console.log(
			`Is recipe ${recipeId} already bookmarked:`,
			isAlreadyBookmarked
		);

		if (isAlreadyBookmarked) {
			console.log(`Recipe ${recipeId} is already bookmarked`);
			return { success: true, isBookmarked: true };
		}

		user.bookmarks.push(recipeId);
		await user.save();
		console.log(
			`Recipe ${recipeId} added to bookmarks for user ${sessionUser.id}`
		);
		return { success: true, isBookmarked: true };
	} catch (error) {
		console.error('Error in addBookmark:', error.message);
		throw error;
	}
}

export default addBookmark;
