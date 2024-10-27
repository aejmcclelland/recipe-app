import connectDB from '../../config/database';
import Recipe from '../../models/Recipe';
import { Box, Container } from '@mui/material';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import BackToHomeButton from '@/components/BackToHomeButton';
import RecipesClient from '@/components/RecipesClient';
import SearchBar from '@/components/SearchBar';
// Fetch the data from MongoDB using Mongoose

export default async function RecipesPage() {
    await connectDB();

    // Fetch all recipes initially
    const recipes = await Recipe.find().populate('category').lean();
    const recipesWithIds = convertToSerializeableObject(recipes);

    return (
        <Container>
            <SearchBar />
            <RecipesClient recipes={recipesWithIds} />
            <BackToHomeButton />
        </Container>
    );
}

