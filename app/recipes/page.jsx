
import connectDB from '@/config/database';
import Recipe from '../../models/Recipe';
import { Container } from '@mui/material';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeSearchForm from '@/components/RecipeSearchForm';
import BackToHomeButton from '@/components/BackToHomeButton';
import RecipesClient from '@/components/RecipesClient';
import { getSessionUser } from '@/utils/getSessionUser';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
        redirect('/recipes/signin');
    }
    const user = sessionUser?.user || null;
    try {
        await connectDB();

        const recipes = await Recipe.find().populate('category').lean();
        const recipesWithIds = convertToSerializeableObject(recipes);

        // Fetch user data
        // Fetch user session data



        return (
            <Container>
                <RecipeSearchForm />
                <RecipesClient recipes={recipesWithIds} user={user} />
                <BackToHomeButton />
            </Container>
        );
    } catch (error) {
        console.error('Error loading RecipesPage:', error.message);
        return (
            <Container>
                <p>Something went wrong while loading the recipes. Please try again later.</p>
            </Container>
        );
    }
}

