// models/Ingredient.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IngredientDocument extends Document {
	name: string;
}

const ingredientSchema = new Schema<IngredientDocument>({
	name: {
		type: String,
		required: true,
		unique: true,
	},
});

const Ingredient =
	(mongoose.models.Ingredient as Model<IngredientDocument>) ||
	mongoose.model<IngredientDocument>('Ingredient', ingredientSchema);

export default Ingredient;
