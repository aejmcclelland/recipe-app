// src/types/recipe.ts
import type mongoose from 'mongoose';
import type { Unit } from '@/utils/measurements';

export interface RecipeResult {
	title: string;
	ingredients: string[];
	steps: string[];
	sourceUrl: string;
	image: string;
	prepTime?: number;
	cookTime?: number;
	serves?: number;
}

export interface RecipeIngredientItem {
	ingredient: mongoose.Types.ObjectId | string;
	quantity?: number | string;
	unit?: Unit;
	customUnit?: string;
}