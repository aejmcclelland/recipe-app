// This action deletes a recipe by its ID, including the associated image from Cloudinary if it exists and is not the default placeholder image. After deletion, it redirects the user back to the recipes page.
'use server';

import cloudinary from '@/config/cloudinary';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import { getOwnedRecipe, ownedRecipeFilter } from '@/utils/recipeAccess';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/utils/getSessionUser';
import { requireVerifiedEmail } from '@/utils/requireVerifiedEmail';

async function deleteRecipe(recipeId) {
	await connectDB();

	const sessionUser = await getSessionUser();
	if (!sessionUser?.id) {
		throw new Error('You must be logged in to delete a recipe');
	}

	const recipe = await getOwnedRecipe(recipeId, sessionUser.id);

	if (!recipe) {
		throw new Error('Recipe not found');
	}

	await requireVerifiedEmail(sessionUser);

	// Extract public id from image url in DB
	const imageUrl = recipe.image || '';
	const parts = imageUrl.split('/');
	const publicId = parts.at(-1)?.split('.').at(0); // Extract public ID

	// Delete image from Cloudinary if a valid publicId exists and it's not the default image
	if (publicId && publicId !== 'placeholder-food') {
		await cloudinary.uploader.destroy(`recipes/${publicId}`);
	}

	// Delete the recipe from the database
	const deleted = await Recipe.findOneAndDelete(ownedRecipeFilter(recipeId, sessionUser.id));
	if (!deleted) throw new Error('Recipe not found');
	redirect('/recipes');
}

export default deleteRecipe;
