'use server';

import cloudinary from '@/config/cloudinary';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

async function deleteRecipe(recipeId) {
	console.log('Recipe ID to delete:', recipeId);
	await connectDB();

	// Convert the string ID to an ObjectId to ensure it matches the format
	const objectId = new mongoose.Types.ObjectId(recipeId);

	const recipe = await Recipe.findById(objectId);

	// Delete image from Cloudinary if a valid publicId exists and it's not the default image
	if (!recipe) {
		throw new Error('Recipe not found');
	}

	// Extract public id from image url in DB
	const imageUrl = recipe.image;
	const parts = imageUrl.split('/');
	const publicId = parts.at(-1).split('.').at(0); // Extract public ID

	// Delete image from Cloudinary if a valid publicId exists and it's not the default image
	if (publicId && publicId !== '300_bebabf') {
		await cloudinary.uploader.destroy('recipes/' + publicId);
	}

	// Delete the recipe from the database
	await Recipe.findByIdAndDelete(objectId);

	console.log('Recipe deleted successfully');
	// Revalidate the path to ensure the UI reflects the changes
	revalidatePath('/recipes');
}

export default deleteRecipe;
