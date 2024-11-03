
import connectDB from '../../config/database';
import Recipe from '../../models/Recipe';
import { Container } from '@mui/material';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeSearchForm from '@/components/RecipeSearchForm';
import BackToHomeButton from '@/components/BackToHomeButton';
import RecipesClient from '@/components/RecipesClient';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
    await connectDB();

    const recipes = await Recipe.find().populate('category').lean();
    const recipesWithIds = convertToSerializeableObject(recipes);

    return (
        <Container>
            <RecipeSearchForm />
            <RecipesClient recipes={recipesWithIds} />
            <BackToHomeButton />
        </Container>
    );
}

