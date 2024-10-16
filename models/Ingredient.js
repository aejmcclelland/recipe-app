import pkg from 'mongoose'; // Import the entire mongoose package
const { Schema, model, models } = pkg;

const ingredientSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true, // Ensures each ingredient is stored only once
	},
});

const Ingredient = models.Ingredient || model('Ingredient', ingredientSchema);

export default Ingredient;
