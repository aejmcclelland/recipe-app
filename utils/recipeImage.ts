export const DEFAULT_RECIPE_IMAGE = '/images/recipes/default-recipe.jpg';

export function getRecipeImageSrc(image?: string | null): string {
	// Recipes created without an upload may still store this old path.
	if (!image || image === '/default-recipe.jpg') return DEFAULT_RECIPE_IMAGE;
	return image;
}
