import 'server-only';

import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';

export function isRecipeId(value: unknown): value is string {
	return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

// Invalid identities produce a filter that cannot match a recipe.
export function readableRecipeFilter(viewerId?: string) {
	return isRecipeId(viewerId)
		? { $or: [{ user: viewerId }, { sharedWith: viewerId }] }
		: { _id: null };
}

export function ownedRecipeFilter(recipeId: string, ownerId?: string) {
	return isRecipeId(recipeId) && isRecipeId(ownerId)
		? { _id: recipeId, user: ownerId }
		: { _id: null };
}

export async function getOwnedRecipe(recipeId: string, ownerId?: string) {
	if (!isRecipeId(recipeId) || !isRecipeId(ownerId)) return null;
	await connectDB();
	return Recipe.findOne(ownedRecipeFilter(recipeId, ownerId));
}

export async function canReadRecipe(recipeId: string, viewerId?: string) {
	if (!isRecipeId(recipeId) || !isRecipeId(viewerId)) return false;
	await connectDB();
	return Boolean(await Recipe.exists({ _id: recipeId, ...readableRecipeFilter(viewerId) }));
}

export async function getSharedRecipesForViewer(viewerId?: string) {
	if (!isRecipeId(viewerId)) return [];
	await connectDB();
	return Recipe.find({ sharedWith: viewerId, user: { $ne: viewerId } })
		.select('-sharedWith')
		.populate('category')
		.lean();
}

// viewerId must come from getSessionUser, never from client input.
// Keep read access separate from the owner checks in mutation actions.
export async function getRecipeForViewer(recipeId: string, viewerId?: string) {
	if (!isRecipeId(recipeId) || !isRecipeId(viewerId)) return null;

	await connectDB();

	// The UI only needs the owner ID. Never populate a User into client data.
	return Recipe.findOne({ _id: recipeId, ...readableRecipeFilter(viewerId) })
		.select('-sharedWith')
		.populate({ path: 'ingredients.ingredient', model: Ingredient })
		.lean();
}
