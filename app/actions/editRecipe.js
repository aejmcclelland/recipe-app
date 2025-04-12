'use server';

import Recipe from '@/models/Recipe';
import cloudinary from '@/config/cloudinary';
import Category from '@/models/Category';
import { revalidatePath } from 'next/cache';
import connectDB from '@/config/database';
import { getSessionUser } from '@/utils/getSessionUser';

async function updateRecipe(recipeId, formData) {
	await connectDB();

	// Get the user's session
	const sessionUser = await getSessionUser();

	if (!sessionUser) {
		throw new Error('You must be logged in to edit a recipe');
	}
	const { userId } = sessionUser;
	const categoryId = formData.get('category');
	const deleteImage = formData.get('deleteImage') === 'true';

	// Fetch the existing recipe
	const existingRecipe = await Recipe.findById(recipeId);

	// Check if the user is the owner of the recipe
	if (!existingRecipe || existingRecipe.user.toString() !== userId) {
		throw new Error('You are not authorized to edit this recipe');
	}

	let imageUrl = existingRecipe.image;

	// Image upload and handling
	const imageFile = formData.get('imageFile');
	if (imageFile && imageFile.size > 0) {
		const buffer = Buffer.from(await imageFile.arrayBuffer());
		const result = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{ folder: 'recipes' },
				(error, result) => {
					if (error) {
						console.error('Cloudinary upload error:', error);
						reject(new Error('Image upload failed'));
					}
					resolve(result);
				}
			);
			uploadStream.end(buffer);
		});
		imageUrl = result.secure_url;
	} else if (deleteImage) {
		imageUrl =
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1744456700/recipes/placeholder-food.jpg';
	}

	// Handle ingredients data
	const ingredientsData = formData.get('ingredients');
	const ingredientsArray = ingredientsData ? JSON.parse(ingredientsData) : [];
	const ingredients = ingredientsArray.map((ingredientObj) => ({
		ingredient: ingredientObj.ingredient,
		quantity: ingredientObj.quantity,
		unit: ingredientObj.unit,
	}));

	const updatedRecipe = {
		name: formData.get('name'),
		ingredients,
		method: formData.get('method'),
		prepTime: formData.get('prepTime'),
		cookTime: formData.get('cookTime'),
		serves: formData.get('serves'),
		image: imageUrl,
		category: categoryId,
		user: userId,
	};

	try {
		await Recipe.findByIdAndUpdate(recipeId, updatedRecipe);
		revalidatePath(`/recipes/${recipeId}`);
		return recipeId; // Return recipe ID to handle redirection or success message in the caller
	} catch (error) {
		console.error('Error updating recipe:', error);
		throw new Error('Failed to update the recipe');
	}
}

export default updateRecipe;
