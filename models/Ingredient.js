import pkg from 'mongoose'; // Import the entire mongoose package
const { Schema, model, models } = pkg;

const ingredientSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	category: {
		type: String, // e.g., Spice, Protein, Vegetable etc.
	},
});

const Ingredient = models.Ingredient || model('Ingredient', ingredientSchema);

export default Ingredient;
