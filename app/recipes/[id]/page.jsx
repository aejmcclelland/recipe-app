import connectDB from '../../../config/database';
import Recipe from '../../../models/Recipe';
import Ingredient from '@/models/Ingredient';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeCard from '@/components/RecipeCard';
import { Box, Typography, Container, Button } from '@mui/material';
import BackToHomeButton from '@/components/BackToHomeButton';
import Link from 'next/link';
import { getSessionUser } from '@/utils/getSessionUser';
import RecipeNotFound from '@/components/RecipeNotFound';

export default async function RecipeDetailPage({ params }) {
    const sessionUser = await getSessionUser();

    await connectDB();
    const { id: recipeId } = await params;

    // Fetch the recipe by its unique ID, populating the owner field
    const recipe = await Recipe.findById(recipeId)
        .populate({ path: 'ingredients.ingredient', model: Ingredient })
        .populate('user') // Ensure the owner's ID is available for comparison
        .lean();

    // Check if recipe is found, if not render RecipeNotFound
    if (!recipe) {
        return <RecipeNotFound />; // Renders the Client Component to handle toast and redirect
    }

    const serializedRecipe = convertToSerializeableObject(recipe);

    return (
        <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    {recipe.name} Details
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <RecipeCard recipe={serializedRecipe} />
            </Box>

            {/* Conditionally show the Edit button only if the logged-in user owns the recipe */}
            {sessionUser && recipe.user && sessionUser.userId === recipe.user._id.toString() && (
                <Link href={`/recipes/${recipe._id}/edit`}>
                    <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                        Edit Recipe
                    </Button>
                </Link>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <BackToHomeButton />
            </Box>
        </Container>
    );
}