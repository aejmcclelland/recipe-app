'use server';

import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import mongoose from 'mongoose';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export async function searchRecipes({ searchQuery, ingredients, category }) {
	await connectDB();

	const filters = [];

	// General search query that looks across multiple fields
	if (searchQuery) {
		filters.push({
			$or: [
				{ name: { $regex: searchQuery, $options: 'i' } },
				{ method: { $regex: searchQuery, $options: 'i' } },
				{
					'ingredients.ingredientName': { $regex: searchQuery, $options: 'i' },
				},
			],
		});
	}

	// If ingredients or category are specified individually
	if (ingredients) {
		filters.push({
			'ingredients.ingredient': mongoose.Types.ObjectId(ingredients),
		});
	}
	if (category) {
		filters.push({ category: mongoose.Types.ObjectId(category) });
	}

	try {
		const recipes = await Recipe.find(
			filters.length ? { $and: filters } : {}
		).lean();
		return convertToSerializeableObject(recipes);
	} catch (error) {
		console.error('Error in searchRecipes:', error);
		throw new Error('Error fetching recipes');
	}
}
