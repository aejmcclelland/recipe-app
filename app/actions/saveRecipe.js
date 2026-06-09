'use server';

import connectDB from '@/config/database';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import { getSessionUser } from '@/utils/getSessionUser';
import {
	EmailVerificationRequiredError,
	requireVerifiedEmail,
} from '@/utils/requireVerifiedEmail';

async function saveRecipe(recipeId) {
	try {
		await connectDB();

		// Get the user's session
		const sessionUser = await getSessionUser();

		if (!sessionUser?.id) {
			throw new Error('You must be logged in to save a recipe');
		}
		await requireVerifiedEmail(sessionUser);
		console.log('Bookmark RecipeId:', recipeId);
		const userId = sessionUser.id;

		// Validate recipe existence
		const recipeExists = await Recipe.exists({ _id: recipeId });
		if (!recipeExists) {
			throw new Error('Recipe not found');
		}

		// Find the user and toggle the recipe in the bookmarks array
		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}
		const isBookmarked = user.bookmarks.includes(recipeId);

		if (isBookmarked) {
			// Remove the recipe if already bookmarked
			user.bookmarks.pull(recipeId);
		} else {
			// Add the recipe if not bookmarked
			user.bookmarks.push(recipeId);
		}

		await user.save();

		return {
			success: true,
			isBookmarked: !isBookmarked, // Return the updated state
		};
	} catch (error) {
		console.error('Error saving recipe:', error.message);
		if (error instanceof EmailVerificationRequiredError) throw error;
		throw new Error('Failed to save the recipe. Please try again.');
	}
}

export default saveRecipe;
