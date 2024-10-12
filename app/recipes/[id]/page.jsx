import connectDB from '../../../config/database';
import Recipe from '../../../models/Recipe';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeCard from '@/components/RecipeCard';
import { Box, Typography, Container } from '@mui/material';

export default async function RecipeDetailPage({ params }) {
    await connectDB();

    // Fetch the recipe by its unique ID from the URL
    const recipe = await Recipe.findById(params.id).populate('ingredients.ingredient').lean();

    if (!recipe) {
        return <p>Recipe not found</p>; // Handle recipe not found scenario
    }

    const serializedRecipe = convertToSerializeableObject(recipe);

    return (
        <Container maxWidth="lg">
            {/* Title for the page */}
            <Box
                sx={{
                    textAlign: 'center',
                    marginTop: 4,
                    marginBottom: 4,
                }}
            >
                <Typography variant="h3" component="h1" gutterBottom>
                    {recipe.name} Details
                </Typography>
            </Box>

            {/* Recipe Card with centered layout */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <RecipeCard recipe={serializedRecipe} /> {/* Using updated RecipeCard */}
            </Box>
        </Container>
    );
}