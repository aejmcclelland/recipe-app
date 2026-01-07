import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const CategorySchema = new Schema({
	name: {
		type: String,
		required: true, // Example: 'Beef', 'Chicken', 'Pasta'
	},
});

const Category = models.Category || model('Category', CategorySchema);

export default Category;
