// app/actions/addRecipe.js
'use server';
import { redirect } from 'next/navigation';
import Category from '@/models/Category';
import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import { getSessionUser } from '@/utils/getSessionUser';

export default async function addRecipe(formData) {
	await connectDB();

	const sessionUser = await getSessionUser();
	if (!sessionUser?.id)
		throw new Error('You must be logged in to add a recipe');

	const userId = sessionUser.id;

	const categoryName = formData.get('category');
	const category = await Category.findOne({
		name: { $regex: new RegExp(categoryName, 'i') },
	});

	if (!category) throw new Error('Category not found');

	// Handle image upload (always use imageFile)
	let imageUrl;
	const imageFile = formData.get('imageFile');
	if (imageFile instanceof File && imageFile.size > 0) {
		const buffer = Buffer.from(await imageFile.arrayBuffer());
		const result = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ folder: 'recipes' }, (error, result) => {
					if (error) return reject(error);
					resolve(result);
				})
				.end(buffer);
		});
		imageUrl = result.secure_url;
	} else {
		imageUrl =
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1744456700/recipes/placeholder-food.jpg';
	}

	// Ingredients array (safe parse)
	let ingredientsArray = [];
	try {
		const rawIngredients = formData.get('ingredients');
		if (typeof rawIngredients === 'string') {
			ingredientsArray = JSON.parse(rawIngredients);
		}
	} catch (err) {
		console.error('Error parsing ingredients:', err);
		throw new Error('Invalid ingredients format');
	}

	//  Normalize ingredients
	const ingredients = await Promise.all(
		ingredientsArray.map(async (ingredientObj) => {
			const name = ingredientObj.ingredient?.trim().toLowerCase();
			if (!name) throw new Error('Ingredient name missing');

			let ingredient = await Ingredient.findOne({ name });
			if (!ingredient) {
				ingredient = new Ingredient({ name });
				await ingredient.save();
			}

			return {
				ingredient: ingredient._id,
				quantity: ingredientObj.quantity,
				unit: ingredientObj.unit,
			};
		})
	);

	let stepsArray = [];
	try {
		const rawSteps = formData.get('steps');
		if (typeof rawSteps === 'string') {
			stepsArray = JSON.parse(rawSteps);
		}
	} catch (err) {
		console.error('Error parsing steps:', err);
		throw new Error('Invalid steps format');
	}

	// extract and sanitize other fields
	const recipeData = {
		name: (formData.get('name') || '').toString(),
		ingredients,
		steps: stepsArray,
		prepTime: Number(formData.get('prepTime') || 0),
		cookTime: Number(formData.get('cookTime') || 0),
		serves: Number(formData.get('serves') || 0),
		image: imageUrl,
		category: category._id,
		user: userId,
	};

	// Save recipe
	const newRecipe = new Recipe(recipeData);
	await newRecipe.save();
	redirect(`/recipes/${newRecipe._id.toString()}`);
}
