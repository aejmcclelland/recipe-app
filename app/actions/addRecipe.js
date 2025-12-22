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
	const ingredients = (
		await Promise.all(
			ingredientsArray.map(async (ingredientObj, idx) => {
				const nameRaw = String(ingredientObj?.ingredient ?? '').trim();
				const name = nameRaw.toLowerCase();

				const rawUnit = String(ingredientObj?.unit ?? '').trim();
				const customUnit = String(ingredientObj?.customUnit ?? '').trim();
				const unit = rawUnit === 'other' ? customUnit : rawUnit;

				const q = ingredientObj?.quantity;
				const quantity = q === '' || q == null ? undefined : Number(q);

				const hasAnyData =
					nameRaw.length > 0 ||
					rawUnit.length > 0 ||
					customUnit.length > 0 ||
					quantity != null;

				// skip totally empty rows
				if (!hasAnyData) return null;

				// if they started filling the row, enforce name
				if (!name) {
					throw new Error(`Ingredient name missing (row ${idx + 1})`);
				}

				// if they chose "other" but didn't type it
				if (rawUnit === 'other' && !customUnit) {
					throw new Error(`Custom unit required (row ${idx + 1})`);
				}

				// if you want to enforce unit when quantity exists
				// (optional: tweak to your preference)
				if (quantity != null && !unit) {
					throw new Error(`Unit required (row ${idx + 1})`);
				}

				let ingredient = await Ingredient.findOne({ name });
				if (!ingredient) {
					ingredient = await Ingredient.create({ name });
				}

				return {
					ingredient: ingredient._id,
					quantity,
					unit: unit || undefined,
				};
			})
		)
	).filter(Boolean);

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
