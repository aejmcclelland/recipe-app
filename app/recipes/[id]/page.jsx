import connectDB from '../../../config/database';
import Recipe from '../../../models/Recipe';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeCard from '@/components/RecipeCard';
import { Box, Typography } from '@mui/material';

export default async function RecipeDetailPage({ params }) {
    await connectDB();

    // Fetch the recipe by its unique ID from the URL
    const recipe = await Recipe.findById(params.id).populate('ingredients.ingredient').lean();

    if (!recipe) {
        return <p>Recipe not found</p>; // Handle recipe not found scenario
    }

    const serializedRecipe = convertToSerializeableObject(recipe);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh', // Ensures it takes up full viewport height
                padding: 2,
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                Recipe Details
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: 600, // Control the maximum width of the card
                }}
            >
                <RecipeCard recipe={serializedRecipe} /> {/* Using RecipeCard */}
            </Box>
        </Box>
    );
}