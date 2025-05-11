export const dynamic = 'force-dynamic';
import connectDB from '@/config/database';
import Recipe from '../models/Recipe';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Category from '@/models/Category';
import HomeClient from '@/components/HomeClient';
import SearchBar from '@/components/SearchBar';
import CategoryFilterSection from '@/components/CategoryFilterSection';
import { Typography } from '@mui/material';
import { getSessionUser } from '@/utils/getSessionUser';
import Hero from '@/components/Hero';
import WelcomeSection from '@/components/WelcomeSection';
import { headers } from 'next/headers';

export default async function Home() {
	await connectDB();

	const sessionUser = await getSessionUser();
	const categories = await Category.find({}).lean();
	const categoriesWithIds = convertToSerializeableObject(categories);

	const headersList = await headers();
	const currentURL = headersList.get('x-url') || '';
	const url = new URL(currentURL, 'http://localhost');
	const isNewUser = url.searchParams.get('page') === 'new';

	let userRecipes = [];

	if (sessionUser) {
		const recipeDocs = await Recipe.find({ user: sessionUser.id }).populate('category').lean();
		userRecipes = convertToSerializeableObject(recipeDocs);
	}

	const firstNameRaw = sessionUser?.name?.split(' ')[0] ?? '';
	const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase();

	return (
		<>
			<Typography variant="h2" align="center" gutterBottom>
				Welcome to Rebekah&#39;s Recipes!
			</Typography>

			{!sessionUser ? (
				<WelcomeSection />
			) : userRecipes.length === 0 && !isNewUser ? (
				<>
					<Typography variant="h5" align="center" gutterBottom>
						Hello, {firstName}!
					</Typography>
					<Typography variant="body1" align="center" gutterBottom>
						Add your own recipes, or better still add your favourite recipes from the web!
					</Typography>
					<Hero />
				</>
			) : userRecipes.length === 0 && isNewUser ? (
				<>
					<Typography variant="h5" align="center" gutterBottom>
						Hello, {firstName}!
					</Typography>
					<Typography variant="body1" align="center" gutterBottom>
						Let’s get started by adding or importing your first recipe.
					</Typography>
					<Hero />
				</>
			) : (
				<>
					<Typography variant="h5" align="center" gutterBottom>
						Hello, {firstName}!
					</Typography>
					<Typography variant="body1" align="center" gutterBottom>
						Add your own recipes, or better still add your favourite recipes from the web!
					</Typography>
					<SearchBar />
					<CategoryFilterSection categories={categoriesWithIds} />
					<HomeClient recipes={userRecipes} user={{ id: sessionUser.id, ...sessionUser }} />
				</>
			)}
		</>
	);
}