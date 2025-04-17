import mongoose from 'mongoose';
import Ingredient from '@/models/Ingredient';

export async function parseScrapedRecipe(rawData: {
	title: string;
	ingredients: string[];
	method: string[];
}): Promise<{
	name: string;
	ingredients: {
		ingredient: mongoose.Types.ObjectId;
		quantity: number;
		unit: string;
	}[];
	method: string;
}> {

	const parsedIngredients = await Promise.all(
		rawData.ingredients.map(async (item) => {
			const name = item.trim().toLowerCase();

			const existing = await Ingredient.findOne({ name }).exec();
			const ingredientDoc = existing
				? existing
				: await new Ingredient({ name }).save();

			return {
				ingredient: ingredientDoc._id as mongoose.Types.ObjectId,
				quantity: 1,
				unit: 'unit',
			};
		})
	);

	return {
		name: rawData.title,
		ingredients: parsedIngredients,
		method: rawData.method.join('\n'),
	};
}
