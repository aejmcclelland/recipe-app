'use server';

import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import { getSessionUser } from '@/utils/getSessionUser';
import { parseScrapedRecipe } from '@/utils/parseScrapedRecipes';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export async function saveScrapedRecipe(data: any, categoryId: string) {
	await connectDB();
	const user = await getSessionUser();

	if (!user || !categoryId) {
		throw new Error('Unauthorized or missing category');
	}

	const parsed: any = await parseScrapedRecipe(data);

	if (parsed.method && typeof parsed.method === 'string') {
		parsed.method = parsed.method
			.split(/[\r\n]+/)
			.map((line: string) => line.replace(/\s+/g, ' ').trim())
			.filter((line) => line !== '');
	}

	const newRecipe = new Recipe({
		...parsed,
		category: categoryId,
		prepTime: 10,
		cookTime: 20,
		serves: 2,
		image:
			data.image && data.image.startsWith('https://res.cloudinary.com/')
				? data.image
				: 'https://res.cloudinary.com/dqeszgo28/image/upload/v1744456700/recipes/placeholder-food.jpg',
		user: user.id,
	});

	await newRecipe.save();

	return convertToSerializeableObject(newRecipe.toObject());
}
