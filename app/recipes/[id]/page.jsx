import { getRecipeForViewer } from '@/utils/recipeAccess';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeCard from '@/components/RecipeCard';
import { Box, Typography, Container } from '@mui/material';
import HomeButton from '@/components/HomeButton';
import { getSessionUser } from '@/utils/getSessionUser';
import RecipeNotFound from '@/components/RecipeNotFound';
import EditRecipeButton from '@/components/EditRecipeButton';
import DeleteRecipeButton from '@/components/DeleteRecipeButton';
import BookmarkButton from '@/components/BookmarkButton';
import RecipeSharing from '@/components/RecipeSharing';

export const metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function RecipeDetailPage({ params }) {
	const resolvedParams = await params;
	const recipeId = resolvedParams?.id;

	if (!recipeId) {
		console.error('Missing recipe ID from route params:', resolvedParams);
		return <RecipeNotFound />;
	}

	// Fetch session user
	const sessionUser = await getSessionUser();

	if (!sessionUser?.id) {
		return <RecipeNotFound />;
	}

	let serializedRecipe;
	let isOwner;
	let shouldShowNotFound = false;

	try {
		const recipe = await getRecipeForViewer(recipeId, sessionUser.id);

		if (!recipe) {
			console.error(`Recipe not found with ID: ${recipeId}`);
			shouldShowNotFound = true;
		} else {
			// Serialize recipe data for client components
			serializedRecipe = convertToSerializeableObject(recipe);

			// Normalise legacy scraped ingredient defaults (avoid displaying ': 1 unit')
			if (Array.isArray(serializedRecipe.ingredients)) {
				serializedRecipe.ingredients = serializedRecipe.ingredients.map((ing) => {
					const isLegacyDefault = ing?.quantity === 1 && ing?.unit === 'unit';
					if (!isLegacyDefault) return ing;

					// Remove the placeholder values so the UI can render just the ingredient name/text
					const rest = { ...ing };
					delete rest.quantity;
					delete rest.unit;
					return rest;
				});
			}

			isOwner = sessionUser.id === serializedRecipe.user?.toString();
		}
	} catch (error) {
		console.error('Error fetching recipe:', error.message);
		shouldShowNotFound = true;
	}

	if (shouldShowNotFound) {
		return <RecipeNotFound />;
	}

	return (
		<Container maxWidth='lg'>
			{/* Recipe Name */}
			<Box sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
				<Typography variant='h3' component='h1' gutterBottom>
					{serializedRecipe.name}
				</Typography>
			</Box>

			{/* Recipe Card */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
				}}>
				<RecipeCard recipe={serializedRecipe} user={sessionUser} />
			</Box>

			{isOwner && (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						flexWrap: 'wrap',
						marginTop: 3,
						gap: 3,
						paddingBottom: 2,
					}}>
					<BookmarkButton recipe={serializedRecipe} />
					<RecipeSharing recipeId={serializedRecipe._id} />
					<EditRecipeButton recipeId={serializedRecipe._id} />
					<DeleteRecipeButton recipeId={serializedRecipe._id} />
					<HomeButton />
				</Box>
			)}
		</Container>
	);
}
