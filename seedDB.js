import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Ingredient from './models/Ingredient.js'; // Assuming Ingredient model is set up
import Recipe from './models/Recipe.js'; // Assuming Recipe model is set up
import Category from './models/Category.js'; // Assuming Category model is set up

const uri = process.env.MONGODB_URI;
console.log('MongoDB URI:', process.env.MONGODB_URI);
async function seedDatabase() {
	try {
		await mongoose.connect(uri);
		// Step 1: Insert Ingredients
		const ingredients = await Ingredient.insertMany([
			{ name: 'Spaghetti', category: 'Pasta' },
			{ name: 'Mince Beef', category: 'Beef' },
			{ name: 'Chopped Tomatoes', category: 'Store' },
			{ name: 'Beef Stock', category: 'Stock' },
			{ name: 'Chopped Onion', category: 'Vegetable' },
			{ name: 'Tomato Puree', category: 'Vegetable' },
			{ name: 'Chicken Breast', category: 'Chicken' },
			{ name: 'Curry Paste', category: 'Spice' },
			{ name: 'Coconut Milk', category: 'Liquid' },
		]);

		// Map the ingredients to make referencing easier
		const ingredientMap = {};
		ingredients.forEach((ingredient) => {
			ingredientMap[ingredient.name] = ingredient._id;
		});

		const categorys = await Category.insertMany([
			{ name: 'Pasta' },
			{ name: 'Beef' },
			{ name: 'Vegetable' },
			{ name: 'Chicken' },
			{ name: 'Soup' },
			{ name: 'Other' },
		]);

		const categoryMap = {};
		categorys.forEach((category) => {
			categoryMap[category.name] = category._id;
		});

		// Step 2: Insert Recipes with Ingredient references
		const recipes = [
			{
				name: 'Spaghetti Bolognese',
				ingredients: [
					{ ingredient: ingredientMap['Spaghetti'], quantity: 200, unit: 'g' },
					{
						ingredient: ingredientMap['Mince Beef'],
						quantity: 250,
						unit: 'g',
					},
					{
						ingredient: ingredientMap['Chopped Tomatoes'],
						quantity: 900,
						unit: 'ml',
					},
					{
						ingredient: ingredientMap['Tomato Puree'],
						quantity: 25,
						unit: 'ml',
					},
					{
						ingredient: ingredientMap['Beef Stock'],
						quantity: 300,
						unit: 'ml',
					},
					{
						ingredient: ingredientMap['Chopped Onion'],
						quantity: 1,
						unit: 'ml',
					},
				],
				method: 'Cook the spaghetti. Fry the beef. Combine with tomato sauce.',
				prepTime: 15,
				cookTime: 60,
				serves: 4,
				category: categoryMap['Beef'],
				image:
					'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			},
			{
				name: 'Chicken Curry',
				ingredients: [
					{
						ingredient: ingredientMap['Chicken Breast'],
						quantity: 300,
						unit: 'g',
					},
					{
						ingredient: ingredientMap['Curry Paste'],
						quantity: 100,
						unit: 'g',
					},
					{
						ingredient: ingredientMap['Coconut Milk'],
						quantity: 400,
						unit: 'ml',
					},
				],
				method: 'Cook the chicken. Add curry paste and coconut milk. Simmer.',
				prepTime: 10,
				cookTime: 25,
				serves: 3,
				category: categoryMap['Chicken'],
				image:
					'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=2800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			},
		];

		await Recipe.insertMany(recipes);
		console.log('Recipes and ingredients inserted successfully');
		mongoose.connection.close();
	} catch (error) {
		console.error('Error inserting data:', error);
	}
}

seedDatabase();