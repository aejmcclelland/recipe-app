
import connectDB from '../config/database';
import Recipe from '../models/Recipe';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Category from '@/models/Category';
import HomeClient from '@/components/HomeClient';
import SearchBar from '@/components/SearchBar'; // Import the SearchBar component

export default async function Home() {
	await connectDB();

	// Fetch all recipes, including their categories for filtering purposes
	const recipes = await Recipe.find().populate('category').lean();
	const recipesWithIds = convertToSerializeableObject(recipes);


	return (<>
		<SearchBar />
		<HomeClient recipes={recipesWithIds} />
	</>);


}