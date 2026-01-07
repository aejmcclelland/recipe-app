// models/Recipe.ts
import mongoose, { Schema, model, models, type Model, type Document } from 'mongoose';
// Ensure referenced models are registered before any populate() calls
import './Category';
import './Ingredient';
import './User';

export type RecipeIngredientItem = {
	ingredient: mongoose.Types.ObjectId;
	quantity?: number;
	unit?: string;
};

export interface IRecipe extends Document {
	name: string;
	ingredients: RecipeIngredientItem[];
	steps: string[];
	prepTime: number;
	cookTime: number;
	serves: number;
	image: string;
	category: mongoose.Types.ObjectId;
	user: mongoose.Types.ObjectId;
}

const recipeSchema = new Schema<IRecipe>({
	name: {
		type: String,
		required: true,
	},
	ingredients: [
		{
			ingredient: {
				type: Schema.Types.ObjectId,
				ref: 'Ingredient',
				required: true,
			},
			quantity: {
				type: Number,
				required: false, // allow scraped/free-text ingredients without parsed quantities
			},
			unit: {
				type: String,
				required: false, // allow scraped/free-text ingredients without parsed units
			},
		},
	],
	steps: {
		type: [String],
		required: true,
	},
	prepTime: {
		type: Number,
		required: true,
	},
	cookTime: {
		type: Number,
		required: true,
	},
	serves: {
		type: Number,
		required: true,
	},
	image: {
		type: String,
		required: true,
		default:
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png',
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

const Recipe: Model<IRecipe> =
	(models.Recipe as Model<IRecipe>) || model<IRecipe>('Recipe', recipeSchema);

export default Recipe;
