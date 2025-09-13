// src/types/recipe.ts
export interface RecipeResult {
	title: string;
	ingredients: string[];
	steps: string[];
	sourceUrl: string;
	image: string;
	prepTime?: int;
	cookTime?: int;
	serves?: int;
}
