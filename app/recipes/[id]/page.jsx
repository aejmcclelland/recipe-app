import connectDB from '../../../config/database';
import Recipe from '../../../models/Recipe';
import Ingredient from '@/models/Ingredient';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeCard from '@/components/RecipeCard';
import { Box, Typography, Container } from '@mui/material';
import HomeButton from '@/components/HomeButton';
import Link from 'next/link';
import { getSessionUser } from '@/utils/getSessionUser';
import RecipeNotFound from '@/components/RecipeNotFound';
import mongoose from 'mongoose';
import EditRecipeButton from '@/components/EditRecipeButton';
import DeleteRecipeButton from '@/components/DeleteRecipeButton';
import BookmarkButton from '@/components/BookmarkButton';


export default async function RecipeDetailPage({ params }) {
    // Destructure recipeId directly from params
    const recipeParams = await params; // Await `params` if it's asynchronous
    const recipeId = recipeParams?.id;
    // Fetch session user
    const sessionUser = await getSessionUser();

    // Connect to DB
    await connectDB();

    // Validate and handle invalid recipeId
    if (!recipeId || !mongoose.Types.ObjectId.isValid(recipeId)) {
        console.error(`Invalid recipe ID: ${recipeId}`);
        return <RecipeNotFound />;
    }

    try {
        // Fetch the recipe by ID, populate necessary fields
        const recipe = await Recipe.findById(recipeId)
            .populate({ path: 'ingredients.ingredient', model: Ingredient })
            .populate('user') // Ensure the owner's info is available
            .lean();

        if (!recipe) {
            console.error(`Recipe not found with ID: ${recipeId}`);
            return <RecipeNotFound />;
        }

        // Serialize recipe data for client components
        const serializedRecipe = convertToSerializeableObject(recipe);

        // Normalise legacy scraped ingredient defaults (avoid displaying ': 1 unit')
        if (Array.isArray(serializedRecipe.ingredients)) {
            serializedRecipe.ingredients = serializedRecipe.ingredients.map((ing) => {
                const isLegacyDefault = ing?.quantity === 1 && ing?.unit === 'unit';
                if (!isLegacyDefault) return ing;

                // Remove the placeholder values so the UI can render just the ingredient name/text
                const { quantity, unit, ...rest } = ing;
                return rest;
            });
        }

        const isOwner = sessionUser?.id && serializedRecipe.user?._id && sessionUser.id === serializedRecipe.user._id.toString();

        return (
            <Container maxWidth="lg">
                {/* Recipe Name */}
                <Box sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        {serializedRecipe.name}
                    </Typography>
                </Box>

                {/* Recipe Card */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <RecipeCard recipe={serializedRecipe} user={sessionUser} />
                </Box>

                {isOwner && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 3, gap: 3, paddingBottom: 2 }}>
                        <BookmarkButton recipe={serializedRecipe} />
                        <EditRecipeButton recipeId={serializedRecipe._id} />
                        <DeleteRecipeButton recipeId={serializedRecipe._id} />
                        <HomeButton />
                    </Box>
                )}
            </Container>
        );
    } catch (error) {
        console.error('Error fetching recipe:', error.message);
        return <RecipeNotFound />;
    }
}