
import connectDB from '../config/database';
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

	const sessionUser = await getSessionUser();

	console.log('Session retrieved on Home page:', sessionUser);
	console.log('Recipes retrieved:', recipesWithIds);

	return (<>
		<Typography variant="h2" align="center" gutterBottom>
			Welcome to Rebekah&#39;s Recipes!
		</Typography>
		<Typography variant="body1" align="center" gutterBottom>
			We are working hard to bring you the best recipes. Please be patient as we add more recipes to our collection.
		</Typography>
		<SearchBar />
		<CategoryFilterSection />
		<HomeClient recipes={recipesWithIds} user={{ id: sessionUser?.id, ...sessionUser }} />
	</>);


}