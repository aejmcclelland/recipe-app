// actions/EditRecipe.js
'use server';

import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import cloudinary from '@/config/cloudinary';
import { revalidatePath } from 'next/cache';
import connectDB from '@/config/database';
import { getSessionUser } from '@/utils/getSessionUser';

async function updateRecipe(recipeId, formData) {
	await connectDB();

	// Get the user's session
	const sessionUser = await getSessionUser();

	if (!sessionUser || !sessionUser.id) {
		throw new Error('You must be logged in to edit a recipe');
	}
	const userId = sessionUser.id;
	const categoryId = formData.get('category');
	const deleteImage = formData.get('deleteImage') === 'true';

	// Fetch the existing recipe
	const existingRecipe = await Recipe.findById(recipeId);

	// Check if the recipe exists
	if (!existingRecipe) {
		throw new Error('Recipe not found');
	}

	// Check if the recipe has an owner (older recipes may predate auth)
	if (!existingRecipe.user) {
		throw new Error('This recipe has no owner set. Please re-save it under your account or contact support.');
	}

	// Check if the user is the owner of the recipe
	if (existingRecipe.user.toString() !== userId) {
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
	let ingredientsArray = [];
	try {
		const ingredientsData = formData.get('ingredients');
		if (typeof ingredientsData === 'string' && ingredientsData.trim()) {
			ingredientsArray = JSON.parse(ingredientsData);
		}
	} catch (err) {
		console.error('Error parsing ingredients:', err);
		throw new Error('Invalid ingredients format');
	}

	// Normalise ingredients so `ingredient` is ALWAYS an ObjectId (your schema expects this)
	const ingredients = (await Promise.all(
		ingredientsArray.map(async (ingredientObj) => {
			// Support both: ingredient as ObjectId string, populated object, or plain name string
			const rawIngredient = ingredientObj?.ingredient;
			const rawId =
				(rawIngredient && typeof rawIngredient === 'object'
					? rawIngredient._id
					: rawIngredient) ?? '';

			let ingredientId = null;

			// If it's a 24-char hex string, treat as ObjectId
			if (typeof rawId === 'string' && /^[a-f\d]{24}$/i.test(rawId.trim())) {
				ingredientId = rawId.trim();
			} else {
				// Otherwise, treat it as a name and upsert into Ingredient collection
				const nameRaw =
					(rawIngredient && typeof rawIngredient === 'object'
						? rawIngredient.name
						: rawIngredient) ?? '';
				const name = String(nameRaw).trim().toLowerCase();
				if (!name) return null; // skip empty rows

				let ingredientDoc = await Ingredient.findOne({ name });
				if (!ingredientDoc) {
					ingredientDoc = new Ingredient({ name });
					await ingredientDoc.save();
				}
				ingredientId = ingredientDoc._id;
			}

			// Handle quantity
			const q = ingredientObj?.quantity;
			const quantity = q === '' || q == null ? undefined : Number(q);

			// Handle unit + customUnit (support 'other' from the form)
			const rawUnit = (ingredientObj?.unit ?? '').toString().trim();
			const customUnit = (ingredientObj?.customUnit ?? '').toString().trim();
			const unit = rawUnit === 'other' ? customUnit : rawUnit;

			return {
				ingredient: ingredientId,
				quantity,
				unit: unit || undefined,
			};
		})
	)).filter(Boolean);

	if (!ingredients.length) {
		throw new Error('Please add at least one ingredient.');
	}

	const updatedRecipe = {
		name: formData.get('name'),
		ingredients,
		steps: (() => {
			const raw = formData.get('steps');
			if (Array.isArray(raw)) return raw;
			if (typeof raw !== 'string') return [];
			try {
				const parsed = JSON.parse(raw);
				return Array.isArray(parsed) ? parsed : [];
			} catch {
				// if it was submitted as a plain string, keep it as a single step
				const s = raw.trim();
				return s ? [s] : [];
			}
		})(),
		prepTime: Number(formData.get('prepTime') || 0),
		cookTime: Number(formData.get('cookTime') || 0),
		serves: Number(formData.get('serves') || 0),
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
