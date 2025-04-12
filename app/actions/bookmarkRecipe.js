'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { revalidatePath } from 'next/cache';

async function bookmarkRecipe(recipeId, recipeName) {
	try {
		await connectDB();

		// 🔍 Debug: Log session before checking
		const sessionUser = await getSessionUser();

		// Ensure sessionUser is valid
		if (!sessionUser || !sessionUser.id) {
			console.error('Error: You must be logged in to bookmark a recipe');
			throw new Error('You must be logged in to bookmark a recipe');
		}

		const userId = sessionUser.id; // ✅ Fix: Directly use `userId`

		// Validate recipeId
		if (!recipeId || typeof recipeId !== 'string') {
			throw new Error(`Invalid recipe ID: ${recipeId}`);
		}

		// Find the user in the database
		const user = await User.findById(userId);
		if (!user) {
			throw new Error(`User not found with ID: ${userId}`);
		}

		// Ensure user.bookmarks is an array
		if (!Array.isArray(user.bookmarks)) {
			throw new Error('Bookmarks data is invalid');
		}

		// Check if the recipe is already bookmarked
		const isBookmarked = user.bookmarks.some(
			(id) => id && id.toString() === recipeId.toString()
		);

		let message;
		if (isBookmarked) {
			// Remove the recipe from bookmarks
			user.bookmarks = user.bookmarks.filter(
				(id) => id && id.toString() !== recipeId.toString()
			);
			message = `Recipe ${recipeName} removed from bookmarks`;
		} else {
			// Add the recipe to bookmarks
			user.bookmarks.push(recipeId);
			message = `Recipe ${recipeName} added to bookmarks`;
		}

		// Save the updated user data
		await user.save();

		// Revalidate the profile page
		revalidatePath('/recipes/profile');

		// Return success response
		return {
			success: true,
			isBookmarked: !isBookmarked,
			message,
		};
	} catch (error) {
		console.error('Error in bookmarkRecipe:', error.message);
		throw new Error('Failed to bookmark recipe. Please try again.');
	}
}

export default bookmarkRecipe;
