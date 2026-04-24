import RecipeEditForm from '@/components/RecipeEditForm';
import RecipeDeleteForm from '@/components/RecipeDeleteForm';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import Category from '@/models/Category';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import { Container, Typography, Box } from '@mui/material';
import { getSessionUser } from '@/utils/getSessionUser';
import RecipeNotFound from '@/components/RecipeNotFound';
import mongoose from 'mongoose';

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

	const recipeDoc = await Recipe.findOne({ _id: recipeId, user: sessionUser.id })
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
		<Container
			maxWidth='md'
			sx={{
				mt: 4,
				justifyContent: 'center',
				alignItems: 'center',
				flexWrap: 'wrap',
			}}>
			<Typography variant='h4' component='h1' align='center' gutterBottom>
				Edit Recipe
			</Typography>
			<Box mt={2}>
				<RecipeEditForm recipe={recipe} categories={serializedCategories} />
			</Box>
			<Box mt={4} display='flex' justifyContent='center'>
				<RecipeDeleteForm recipe={recipe} />
			</Box>
		</Container>
	);
};

export default RecipeEditPage;
