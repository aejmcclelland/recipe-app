import pkg from 'mongoose'; // Import the entire mongoose package
const { Schema, model, models } = pkg;

const CategorySchema = new Schema({
	name: {
		type: String,
		required: true, // Example: 'Beef', 'Chicken', 'Pasta'
	},
});

const Category = models.Category || model('Category', CategorySchema);

export default Category;
