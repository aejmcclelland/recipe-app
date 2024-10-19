'use server';

import Recipe from '@/models/Recipe';
import cloudinary from '@/config/cloudinary';
import Category from '@/models/Category';
import { revalidatePath } from 'next/cache';
import connectDB from '@/config/database';

async function updateRecipe(recipeId, formData) {
	await connectDB();

	const categoryId = formData.get('category');
	const deleteImage = formData.get('deleteImage') === 'true'; // Check if the image should be deleted

	// Fetch the existing recipe
	const existingRecipe = await Recipe.findById(recipeId);
	let imageUrl = existingRecipe.image;

	// If the user uploaded a new image
	const imageFile = formData.get('imageFile');
	if (imageFile && imageFile.size > 0) {
		// Upload new image to Cloudinary
		const result = await cloudinary.uploader.upload(imageFile.path, {
			folder: 'recipes',
		});
		imageUrl = result.secure_url;
	} else if (deleteImage) {
		// If the user chose to delete the image, use the default image
		imageUrl =
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png';
	}

	// Handle ingredients (make sure to parse JSON properly)
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
		image: imageUrl, // Update the image URL
		category: categoryId,
	};

	await Recipe.findByIdAndUpdate(recipeId, updatedRecipe);
	revalidatePath(`/recipes/${recipeId}`);
}

export default updateRecipe;
