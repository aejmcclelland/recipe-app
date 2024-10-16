'use server';

import Category from '@/models/Category';
import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';

async function addRecipe(formData) {
	await connectDB();

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
		// Convert the file object into a buffer and upload to Cloudinary
		const buffer = Buffer.from(await imageFile.arrayBuffer());

		// Upload to Cloudinary
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
	} else if (!imageUrl) {
		imageUrl =
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/recipes/300_bebabf.png'; // Placeholder
	}

	const ingredientsArray = JSON.parse(formData.get('ingredients'));

	// Convert ingredients array to store ObjectIDs
	const ingredientPromises = ingredientsArray.map(async (ingredientObj) => {
		const ingredientName = ingredientObj.ingredient.trim().toLowerCase();

		// Find the ingredient without using lean() since we might need to create and save it
		let ingredient = await Ingredient.findOne({ name: ingredientName });

		if (!ingredient) {
			// Create and save a new ingredient only if it doesn't exist
			ingredient = new Ingredient({ name: ingredientName });
			await ingredient.save();
		}

		// Return the formatted ingredient data for the recipe
		return {
			ingredient: ingredient._id, // Store the ObjectID reference to the ingredient
			quantity: ingredientObj.quantity,
			unit: ingredientObj.unit,
		};
	});

	// Wait for all ingredient lookups/creations to complete
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
	};

	try {
		const newRecipe = new Recipe(recipeData);
		await newRecipe.save();
		console.log('Full Recipe Object:', newRecipe);
		console.log('Recipe ingredients:', newRecipe.ingredients);
		return newRecipe._id.toString();
	} catch (error) {
		console.error('Error saving recipe:', error);
		throw new Error('Failed to save the recipe');
	}
}

export default addRecipe;
