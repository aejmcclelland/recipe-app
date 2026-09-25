import 'server-only';

import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';

// viewerId must come from getSessionUser, never from client input.
// Keep read access separate from the owner checks in mutation actions.
export async function getRecipeForViewer(recipeId: string, viewerId?: string) {
	if (
		typeof recipeId !== 'string' || !/^[a-f\d]{24}$/i.test(recipeId) ||
		typeof viewerId !== 'string' || !/^[a-f\d]{24}$/i.test(viewerId)
	) return null;

	await connectDB();

	// The UI only needs the owner ID. Never populate a User into client data.
	return Recipe.findOne({ _id: recipeId, user: viewerId })
		.populate({ path: 'ingredients.ingredient', model: Ingredient })
		.lean();
}
