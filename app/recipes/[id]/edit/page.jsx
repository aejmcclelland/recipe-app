import RecipeDeleteForm from '@/components/RecipeDeleteForm';
import RecipeEditForm from '@/components/RecipeEditForm';
import RecipeNotFound from '@/components/RecipeNotFound';
import connectDB from '@/config/database';
import Category from '@/models/Category';
import Recipe from '@/models/Recipe';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import { getSessionUser } from '@/utils/getSessionUser';
import { Box, Typography } from '@mui/material';
import mongoose from 'mongoose';
import NextLink from 'next/link';

const RecipeEditPage = async ({ params }) => {
	await connectDB();

	const resolvedParams = await params;
	const recipeId = resolvedParams?.id;
	const sessionUser = await getSessionUser();

	if (!recipeId) {
		console.error('Missing recipe ID from route params:', resolvedParams);
		return <RecipeNotFound />;
	}

	if (!sessionUser?.id || !mongoose.Types.ObjectId.isValid(recipeId)) {
		return <RecipeNotFound />;
	}

	const recipeDoc = await Recipe.findOne({
		_id: recipeId,
		user: sessionUser.id,
	})
		.populate('ingredients.ingredient')
		.lean();

	if (!recipeDoc) {
		return <RecipeNotFound />;
	}

	const recipe = convertToSerializeableObject(recipeDoc);

	// Fetch all categories to pass to the form
	const categories = await Category.find({}).lean();
	const serializedCategories = convertToSerializeableObject(categories);

	return (
		<Box sx={{ maxWidth: 800, mx: 'auto', py: { xs: 2, md: 4 } }}>
			<NextLink
				href={`/recipes/${recipe._id}`}
				style={{ textDecoration: 'none' }}>
				<Typography
					component='span'
					color='text.secondary'
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						minHeight: 44,
						mb: 2,
						'&:hover': {
							textDecoration: 'underline',
						},
					}}>
					Back to recipe
				</Typography>
			</NextLink>
			<Typography variant='h2' component='h1' gutterBottom>
				Edit Recipe
			</Typography>
			<Typography color='text.secondary' sx={{ mb: 4 }}>
				Update your recipe details below.
			</Typography>
			<RecipeEditForm recipe={recipe} categories={serializedCategories} />
			<Box
				component='section'
				aria-labelledby='delete-recipe-heading'
				sx={{ mt: 5, pt: 4, borderTop: 1, borderColor: 'divider' }}>
				<Typography
					id='delete-recipe-heading'
					variant='h5'
					component='h2'
					gutterBottom>
					Delete recipe
				</Typography>
				<Typography color='text.secondary' sx={{ mb: 2 }}>
					Permanently remove this recipe from your collection.
				</Typography>
				<RecipeDeleteForm recipe={recipe} appearance='edit' />
			</Box>
		</Box>
	);
};

export default RecipeEditPage;
