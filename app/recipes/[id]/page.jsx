import connectDB from '../../../config/database';
import Recipe from '../../../models/Recipe';
import Ingredient from '@/models/Ingredient';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeCard from '@/components/RecipeCard';
import { Box, Typography, Container, Button } from '@mui/material';
import BackToHomeButton from '@/components/BackToHomeButton';
import Link from 'next/link';

export default async function RecipeDetailPage({ params }) {

    // NOTE: check if running in production on vercel and get
    // the public URL at build time for the ShareButtons, or fall back to localhost in development.
    const PUBLIC_DOMAIN = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    await connectDB();
    // Extract the recipe ID from the URL parameters
    const { id: recipeId } = params;

    // Fetch the recipe by its unique ID from the URL
    // When fetching the recipe
    const recipe = await Recipe.findById(recipeId)
        .populate({ path: 'ingredients.ingredient', model: Ingredient })
        .lean();

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
            <Link href={`/recipes/${recipe._id}/edit`}>
                <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Edit Recipe
                </Button>
            </Link>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <BackToHomeButton />
            </Box>
        </Container>
    );
}