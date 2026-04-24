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
	sourceUrl?: unknown;
	prepTime?: unknown;
	cookTime?: unknown;
	serves?: unknown;
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

function getOptionalString(input: unknown, key: string): string | undefined {
	if (!isRecord(input)) return undefined;
	const value = input[key];
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getOptionalPositiveNumber(input: unknown, key: string): number | undefined {
	if (!isRecord(input)) return undefined;

	const value = input[key];
	if (typeof value === 'number') {
		return Number.isFinite(value) && value > 0 ? value : undefined;
	}

	if (typeof value === 'string' && value.trim()) {
		const parsed = Number(value.trim());
		return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
	}

	return undefined;
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
	const sessionUser = await getSessionUser();
	const safeCategoryId = typeof categoryId === 'string' ? categoryId.trim() : '';

	if (!sessionUser?.id) {
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
		prepTime: getOptionalPositiveNumber(data, 'prepTime') ?? 10,
		cookTime: getOptionalPositiveNumber(data, 'cookTime') ?? 20,
		serves: getOptionalPositiveNumber(data, 'serves') ?? 2,
		image:
			getImageUrl(data) ??
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1744456700/recipes/placeholder-food.jpg',
		sourceUrl: getOptionalString(data, 'sourceUrl'),
		user: sessionUser.id,
	});
	await newRecipe.save();

	return convertToSerializeableObject(newRecipe.toObject());
}
