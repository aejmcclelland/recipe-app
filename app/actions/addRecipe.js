'use server';

import Category from '@/models/Category';
import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import { getSessionUser } from '@/utils/getSessionUser';

async function addRecipe(formData) {
	await connectDB();

	// Get the user's session
	const sessionUser = await getSessionUser();

	if (!sessionUser || !sessionUser.id) {
		throw new Error('You must be logged in to add a recipe');
	}

	const userId = sessionUser.id; // ✅ Ensure correct user ID is used

	const categoryName = formData.get('category');
	const category = await Category.findOne({
		name: { $regex: new RegExp(categoryName, 'i') },
	});

	if (!category) {
		throw new Error('Category not found');
	}

	// Handle image upload
	let imageUrl = formData.get('image');
	const imageFile = formData.get('imageFile');

	if (imageFile && imageFile.size > 0) {
		const buffer = Buffer.from(await imageFile.arrayBuffer());

		const result = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{ folder: 'recipes' },
				(error, result) => {
					if (error) {
						console.error('❌ Cloudinary upload error:', error);
						reject(new Error('Image upload failed'));
					}
					resolve(result);
				}
			);
			uploadStream.end(buffer);
		});
		imageUrl = result.secure_url;
	} else if (!imageUrl) {
		imageUrl =
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1744456700/recipes/placeholder-food.jpg'; // Placeholder
	}

	const ingredientsArray = JSON.parse(formData.get('ingredients'));

	// Convert ingredients array to store ObjectIDs
	const ingredientPromises = ingredientsArray.map(async (ingredientObj) => {
		const ingredientName = ingredientObj.ingredient.trim().toLowerCase();
		let ingredient = await Ingredient.findOne({ name: ingredientName });

		if (!ingredient) {
			ingredient = new Ingredient({ name: ingredientName });
			await ingredient.save();
		}

		return {
			ingredient: ingredient._id,
			quantity: ingredientObj.quantity,
			unit: ingredientObj.unit,
		};
	});

	const ingredients = await Promise.all(ingredientPromises);

	const recipeData = {
		name: formData.get('name'),
		ingredients,
		method: formData.get('method'),
		prepTime: formData.get('prepTime'),
		cookTime: formData.get('cookTime'),
		serves: formData.get('serves'),
		image: imageUrl,
		category: category._id,
		user: userId, // ✅ Ensure MongoDB user ID is assigned correctly
	};

	try {
		const newRecipe = new Recipe(recipeData);
		await newRecipe.save();
		return newRecipe._id.toString(); // Return the ID for redirection
	} catch (error) {
		console.error('❌ Error saving recipe:', error);
		throw new Error('Failed to save the recipe');
	}
}
export default addRecipe;
