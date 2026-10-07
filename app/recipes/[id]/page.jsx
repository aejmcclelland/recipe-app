import BookmarkButton from '@/components/BookmarkButton';
import DeleteRecipeButton from '@/components/DeleteRecipeButton';
import EditRecipeButton from '@/components/EditRecipeButton';
import HomeButton from '@/components/HomeButton';
import RecipeCard from '@/components/RecipeCard';
import RecipeNotFound from '@/components/RecipeNotFound';
import RecipeSharing from '@/components/RecipeSharing';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import { getSessionUser } from '@/utils/getSessionUser';
import { getRecipeForViewer } from '@/utils/recipeAccess';
import { Box, Container, Typography } from '@mui/material';

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
				serializedRecipe.ingredients = serializedRecipe.ingredients.map(
					(ing) => {
						const isLegacyDefault = ing?.quantity === 1 && ing?.unit === 'unit';
						if (!isLegacyDefault) return ing;

						// Remove the placeholder values so the UI can render just the ingredient name/text
						const rest = { ...ing };
						delete rest.quantity;
						delete rest.unit;
						return rest;
					},
				);
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
		<Container maxWidth='lg' disableGutters>
			{/* Recipe Name */}
			<Box sx={{ mt: { xs: 1, md: 2 }, mb: 3 }}>
				<Typography
					variant='h2'
					component='h1'
					sx={{ overflowWrap: 'anywhere' }}>
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
						display: {
							xs: 'block',
							sm: 'flex',
						},
						gridTemplateColumns: {
							xs: '1fr 1fr',
							sm: 'none',
						},
						justifyContent: 'flex-start',
						alignItems: 'center',
						flexWrap: {
							sm: 'wrap',
						},
						marginTop: 5,
						paddingTop: 3,
						borderTop: '1px solid',
						borderColor: 'divider',
						gap: 1.5,
						paddingBottom: 2,
					}}>
					<Box sx={{ mb: { xs: 1.5, sm: 0 } }}>
						<BookmarkButton recipe={serializedRecipe} appearance='detail' />
					</Box>
					<Box
						sx={{
							display: {
								xs: 'grid',
								sm: 'flex',
							},
							gridTemplateColumns: {
								xs: '1fr 1fr',
							},
							gap: 1.5,
							flexWrap: {
								sm: 'wrap',
							},
						}}>
						<RecipeSharing recipeId={serializedRecipe._id} />
						<EditRecipeButton
							recipeId={serializedRecipe._id}
							appearance='detail'
						/>
						<DeleteRecipeButton
							recipeId={serializedRecipe._id}
							appearance='detail'
						/>
						<HomeButton appearance='detail' />
					</Box>
				</Box>
			)}
		</Container>
	);
}
