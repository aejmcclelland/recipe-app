'use server';

import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import { getSessionUser } from '@/utils/getSessionUser';
import { parseScrapedRecipe } from '@/utils/parseScrapedRecipes';
import { convertToSerializeableObject } from '@/utils/convertToObject';

// Treat scraped input as untrusted external data.
type RawScrapedRecipe = {
	title: string;
	ingredients: string[];
	steps: string[];
	image?: unknown;
};

function isStringArray(value: unknown): value is string[] {
	return (
		Array.isArray(value) &&
		value.every((v) => typeof v === 'string' && v.trim().length > 0)
	);
}

function isRawScrapedRecipe(value: unknown): value is RawScrapedRecipe {
	if (!isRecord(value)) return false;
	return (
		typeof value.title === 'string' &&
		value.title.trim().length > 0 &&
		isStringArray(value.ingredients) &&
		isStringArray(value.steps)
	);
}

// What we expect to store (based on your normalisation below).
type ParsedRecipe = {
	steps?: unknown;
	[key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function getImageUrl(input: unknown): string | undefined {
	if (!isRecord(input)) return undefined;
	const img = input.image;
	return typeof img === 'string' && img.trim() ? img : undefined;
}

function normaliseSteps(steps: unknown): string[] {
	if (typeof steps === 'string') {
		return steps
			.split(/[\r\n]+/)
			.map((line) => line.replace(/\s+/g, ' ').trim())
			.filter(Boolean);
	}

	if (Array.isArray(steps)) {
		return steps
			.map((line) => (typeof line === 'string' ? line : ''))
			.map((line) => line.replace(/\s+/g, ' ').trim())
			.filter(Boolean);
	}

	return [];
}

export async function saveScrapedRecipe(data: unknown, categoryId: string) {
	await connectDB();
	const user = await getSessionUser();

	const userId = (user as any)?.id ?? (user as any)?.userId;
	const safeCategoryId = typeof categoryId === 'string' ? categoryId.trim() : '';

	// Helpful debug while diagnosing intermittent auth/category issues
	console.log('saveScrapedRecipe auth check:', {
		hasUser: !!user,
		userId,
		safeCategoryId,
	});

	if (!userId) {
		throw new Error('Unauthorized: missing session user');
	}
	if (!safeCategoryId) {
		throw new Error('Missing category');
	}
	if (!isRawScrapedRecipe(data)) {
		throw new Error('Invalid scraped recipe data');
	}

	const parsed = (await parseScrapedRecipe(data)) as ParsedRecipe;

	// Normalise steps to a string[] (Recipe schema expects an array of strings)
	parsed.steps = normaliseSteps(parsed.steps);

	const newRecipe = new Recipe({
		...parsed,
		category: safeCategoryId,
		prepTime: 10,
		cookTime: 20,
		serves: 2,
		image:
			getImageUrl(data) ??
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1744456700/recipes/placeholder-food.jpg',
		user: userId,
	});
	await newRecipe.save();

	return convertToSerializeableObject(newRecipe.toObject());
}
