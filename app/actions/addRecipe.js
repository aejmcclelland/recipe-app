'use server';

import Category from '@/models/Category';
import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import Recipe from '@/models/Recipe';
import Ingredient from '@/models/Ingredient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function addRecipe(formData) {
	await connectDB();

	const categoryName = formData.get('category');
	const category = await Category.findOne({
		name: { $regex: new RegExp(categoryName, 'i') }, // Case-insensitive search
	});

	if (!category) {
		throw new Error('Category not found');
	}

	// Image upload logic
	let imageUrl = formData.get('image');
	const imageFile = formData.get('imageFile'); // Handle file upload

	if (imageFile && imageFile.name) {
		const result = await cloudinary.uploader.upload(imageFile.path, {
			folder: 'recipes', // Folder name in Cloudinary
		});
		imageUrl = result.secure_url;
	} else if (!imageUrl) {
		imageUrl =
			'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png'; // Placeholder image URL
	}

	const recipeData = {
		name: formData.get('name'),
		ingredients: JSON.parse(formData.get('ingredients')), // Parse the ingredients string
		method: formData.get('method'),
		prepTime: formData.get('prepTime'),
		cookTime: formData.get('cookTime'),
		serves: formData.get('serves'),
		image: imageUrl,
		category: category._id,
	};

	const newRecipe = new Recipe(recipeData);
	await newRecipe.save();

	revalidatePath('/recipes');
	redirect(`/recipes/${newRecipe._id}`);
}

export default addRecipe;
