// app/actions/searchRecipes.js
'use server';

import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export async function searchRecipes({ searchQuery, ingredients, category }) {
	await connectDB();

	const filters = [];

	// 1. Recipe name-based search
	if (searchQuery) {
		filters.push({ name: { $regex: searchQuery, $options: 'i' } });
	}

	// 2. Ingredient-based search
	if (ingredients || searchQuery) {
		const ingredientSearch = ingredients || searchQuery;

		// Find ingredient IDs that match the search term
		const matchedIngredients = await Ingredient.find({
			name: { $regex: ingredientSearch, $options: 'i' },
		}).select('_id');

		if (matchedIngredients.length > 0) {
			filters.push({
				'ingredients.ingredient': {
					$in: matchedIngredients.map((ing) => ing._id),
				},
			});
		}
	}

	// 3. Category-based search
	if (category) {
		filters.push({ category });
	}

	// Combine filters with $or to allow name or ingredient matching
	const query = filters.length > 0 ? { $or: filters } : {};

	try {
		const recipes = await Recipe.find(query)
			.populate('ingredients.ingredient') // Populate ingredient details for display
			.lean();

		console.log('Recipes found:', recipes);
		return convertToSerializeableObject(recipes);
	} catch (error) {
		console.error('Error in searchRecipes:', error);
		throw new Error('Error fetching recipes');
	}
}
