// app/actions/searchRecipes.js
'use server';

import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export async function searchRecipes({ searchQuery, ingredients, category }) {
	await connectDB();

	const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	const orFilters = [];
	const andFilters = [];

	const nameTerm = (searchQuery || '').trim();
	const ingredientTerm = (ingredients || '').trim();

	// 1) Name-based search
	if (nameTerm) {
		orFilters.push({ name: { $regex: escapeRegex(nameTerm), $options: 'i' } });
	}

	// 2) Ingredient-based search
	const ingredientSearch = ingredientTerm || nameTerm;
	if (ingredientSearch) {
		const matchedIngredients = await Ingredient.find({
			name: { $regex: escapeRegex(ingredientSearch), $options: 'i' },
		}).select('_id');

		// If the user explicitly typed something into the ingredient field and nothing matches,
		// return no results rather than falling back to category/all.
		if (ingredientTerm && matchedIngredients.length === 0) {
			return [];
		}

		if (matchedIngredients.length > 0) {
			orFilters.push({
				'ingredients.ingredient': {
					$in: matchedIngredients.map((ing) => ing._id),
				},
			});
		}
	}

	// 3. Category-based search
	if (category) {
		andFilters.push({ category });
	}
	//Build final Query
	if (orFilters.length > 0) andFilters.push({ $or: orFilters });
	const query = andFilters.length > 0 ? { $and: andFilters } : {};

	// Execute the query
	const recipes = await Recipe.find(query)
		.populate('ingredients.ingredient')
		.lean();
	return convertToSerializeableObject(recipes);
}
