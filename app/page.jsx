
import connectDB from '@/config/database';
import Recipe from '../models/Recipe';

import { convertToSerializeableObject } from '@/utils/convertToObject';
import Category from '@/models/Category';
import HomeClient from '@/components/HomeClient';
import SearchBar from '@/components/SearchBar';
import CategoryFilterSection from '@/components/CategoryFilterSection';
import { Typography } from '@mui/material';
import { getSessionUser } from '@/utils/getSessionUser';

export default async function Home() {
	await connectDB();

	// Fetch all recipes, including their categories for filtering purposes
	const recipes = await Recipe.find().populate('category').lean();
	const recipesWithIds = convertToSerializeableObject(recipes);

	const categories = await Category.find({}).lean();
	const categoriesWithIds = convertToSerializeableObject(categories);

	const sessionUser = await getSessionUser();

	console.log('Recipes retrieved:', recipesWithIds);

	return (<>
		<Typography variant="h2" align="center" gutterBottom>
			Welcome to Rebekah&#39;s Recipes!
		</Typography>
		<Typography variant="body1" align="center" gutterBottom>
			Add your own recipes, or browse through our collection of delicious recipes, or better still add your favourite recipes from the web!
		</Typography>
		<SearchBar />
		<CategoryFilterSection categories={categoriesWithIds} />
		<HomeClient recipes={recipesWithIds} user={{ id: sessionUser?.id, ...sessionUser }} />
	</>);


}