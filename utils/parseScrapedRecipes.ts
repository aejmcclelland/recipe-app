// utils/parseScrapedRecipes.ts
import mongoose from 'mongoose';
import Ingredient from '@/models/Ingredient';
import { normaliseScrapedIngredient } from './normaliseScrapedIngredient';

export async function parseScrapedRecipe(rawData: {
	title: string;
	ingredients: string[];
	steps: string[];
}): Promise<{
	name: string;
	ingredients: {
		ingredient: mongoose.Types.ObjectId;
		quantity?: number;
		unit?: string;
	}[];
	steps: string[];
}> {
	const parsedIngredients = await Promise.all(
		rawData.ingredients.map(async (item) => {
			const normalised = normaliseScrapedIngredient(item);
			// Preserve the importer's shared-name canonicalisation, including fallback lines.
			const name = normalised.ingredient.trim().toLowerCase();

			const ingredientDoc = await Ingredient.findOneAndUpdate(
				{ name },
				{ $setOnInsert: { name } },
				{
					upsert: true,
					returnDocument: 'after',
					setDefaultsOnInsert: true,
				}
			)
				.select('_id')
				.exec();

			return {
				ingredient: ingredientDoc._id as mongoose.Types.ObjectId,
				...(normalised.parsed ? { quantity: normalised.quantity, unit: normalised.unit } : {}),
			};
		})
	);

	return {
		name: rawData.title,
		ingredients: parsedIngredients,
		steps: rawData.steps,
	};
}
