export const dynamic = 'force-dynamic';
import CategoryFilterSection from '@/components/CategoryFilterSection';
import Hero from '@/components/Hero';
import HomeClient from '@/components/HomeClient';
import SearchBar from '@/components/SearchBar';
import WelcomeSection from '@/components/WelcomeSection';
import connectDB from '@/config/database';
import Category from '@/models/Category';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import { getSessionUser } from '@/utils/getSessionUser';
import { getSharedRecipesForViewer } from '@/utils/recipeAccess';
import { Box, Typography } from '@mui/material';
import { headers } from 'next/headers';
import Recipe from '../models/Recipe';

const homepageDescription =
	'Keep all the recipes you love in one place. Save recipes from around the web, add your own favourites, organise them and share them with family and friends.';

export const metadata = {
	title: 'Keep Your Favourite Recipes Together',
	description: homepageDescription,
	alternates: {
		canonical: '/',
	},
	openGraph: {
		title: "Keep Your Favourite Recipes Together | Rebekah's Recipes",
		description: homepageDescription,
		url: '/',
	},
	twitter: {
		card: 'summary',
		title: "Keep Your Favourite Recipes Together | Rebekah's Recipes",
		description: homepageDescription,
	},
};

const webApplicationJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: "Rebekah's Recipes",
	url: 'https://www.rebekahsrecipes.com',
	applicationCategory: 'LifestyleApplication',
	operatingSystem: 'Web',
	description:
		'Keep all the recipes you love in one place. Save recipes from around the web, add your own favourites, organise them and share them with family and friends.',
	featureList: [
		'Save your own recipes online',
		'Save recipes from supported websites',
		'Add and organise your own recipes',
		'Share recipes with family and friends',
	],
	offers: {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'GBP',
	},
};

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
	let sharedRecipes = [];

	if (sessionUser) {
		const recipeDocs = await Recipe.find({ user: sessionUser.id })
			.populate('category')
			.lean();
		userRecipes = convertToSerializeableObject(recipeDocs);
		sharedRecipes = convertToSerializeableObject(
			await getSharedRecipesForViewer(sessionUser.id),
		);
	}

	const firstNameRaw = sessionUser?.name?.split(' ')[0] ?? '';
	const firstName =
		firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase();
	const hasRecipes = userRecipes.length > 0 || sharedRecipes.length > 0;

	function renderHomeContent() {
		if (!sessionUser) {
			return (
				<>
					<WelcomeSection />
					<Box
						component='section'
						sx={{
							px: { xs: 3, sm: 5, lg: 7 },
							py: { xs: 4, md: 5 },
							backgroundColor: '#f8f5ee',
							color: '#1a2027',
							textAlign: 'center',
						}}>
						<Typography
							component='p'
							sx={{ maxWidth: 900, mx: 'auto', fontWeight: 700 }}>
							Rebekah’s Recipes is a personal recipe organiser for saving recipes
							from supported websites, adding your own recipes, organising
							favourites, bookmarking recipes and sharing them with family and
							friends.
						</Typography>
					</Box>
				</>
			);
		}

		if (!hasRecipes) {
			return <Hero />;
		}

		return (
			<>
				<Box
					sx={{
						width: '100%',
						maxWidth: 900,
						mx: 'auto',
					}}>
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<SearchBar />
					</Box>
				</Box>
				<CategoryFilterSection categories={categoriesWithIds} />
				<HomeClient
					recipes={userRecipes}
					sharedRecipes={sharedRecipes}
					user={{ id: sessionUser.id, ...sessionUser }}
				/>
				{userRecipes.length === 0 && <Hero />}
			</>
		);
	}

	return (
		<>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(webApplicationJsonLd),
				}}
			/>
			{sessionUser ? (
				<Box
					component='main'
					data-testid='authenticated-home'
					sx={{ py: { xs: 2, sm: 4 } }}>
					<Box component='header' sx={{ mb: { xs: 4, sm: 5 } }}>
						<Typography
							component='h1'
							variant='h2'
							sx={{ fontSize: { xs: '2.25rem', sm: '3rem' }, mb: 1.5 }}>
							Hello, {firstName}!
						</Typography>
						<Typography color='text.secondary' sx={{ maxWidth: 620 }}>
							{!hasRecipes && isNewUser
								? 'Let’s get started by adding or importing your first recipe.'
								: 'Add your own recipes, or better still add your favourite recipes from the web!'}
						</Typography>
					</Box>
					{renderHomeContent()}
				</Box>
			) : (
				renderHomeContent()
			)}
		</>
	);
}
