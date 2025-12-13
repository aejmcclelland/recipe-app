// utils/parseScrapedRecipes.ts
import mongoose from 'mongoose';
import Ingredient from '@/models/Ingredient';

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
			const name = item.trim().toLowerCase();

			const existing = await Ingredient.findOne({ name }).exec();
			const ingredientDoc = existing
				? existing
				: await new Ingredient({ name }).save();

			return {
				ingredient: ingredientDoc._id as mongoose.Types.ObjectId
			};
		})
	);

	return {
		name: rawData.title,
		ingredients: parsedIngredients,
		steps: rawData.steps,
	};
}
