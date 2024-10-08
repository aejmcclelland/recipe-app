import pkg from 'mongoose'; // Import the entire mongoose package
const { Schema, model, models } = pkg;

const recipeSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	ingredients: [
		{
			ingredient: {
				type: Schema.Types.ObjectId,
				ref: 'Ingredient', // Reference to the Ingredient model
				required: true,
			},
			quantity: {
				type: Number, // The specific quantity for this recipe
				required: true,
			},
			unit: {
				type: String, // The unit (grams, ml, etc.)
				required: true,
			},
		},
	],
	method: {
		type: String,
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
	},
	category: {
		type: Schema.Types.ObjectId, // References the Category schema
		ref: 'Category',
		required: true,
	},
});

const Recipe = models.Recipe || model('Recipe', recipeSchema);

export default Recipe;
