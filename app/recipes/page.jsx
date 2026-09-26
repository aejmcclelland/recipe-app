// app/recipes/page.jsx
export const dynamic = 'force-dynamic';

export const metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

import connectDB from '@/config/database';
import Recipe from '../../models/Recipe';
import { Container } from '@mui/material';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeSearchForm from '@/components/RecipeSearchForm';
import BackToHomeButton from '@/components/BackToHomeButton';
import RecipesClient from '@/components/RecipesClient';
import { getSessionUser } from '@/utils/getSessionUser';
import { redirect } from 'next/navigation';
import { getSharedRecipesForViewer } from '@/utils/recipeAccess';


export default async function RecipesPage() {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
        redirect('/recipes/signin');
    }
    const user = { id: sessionUser.id, ...sessionUser };
    let recipesWithIds;
    let sharedRecipes;
    let loadError = false;

    try {
        await connectDB();

        const recipes = await Recipe.find({ user: sessionUser.id })
            .populate('category')
            .lean();
        recipesWithIds = convertToSerializeableObject(recipes);

        sharedRecipes = convertToSerializeableObject(await getSharedRecipesForViewer(sessionUser.id));
    } catch (error) {
        console.error('Error loading RecipesPage:', error.message);
        loadError = true;
    }

    if (loadError) {
        return (
            <Container data-testid="recipes-page">
                <p>Something went wrong while loading the recipes. Please try again later.</p>
            </Container>
        );
    }

    return (
        <Container data-testid="recipes-page">
            <RecipeSearchForm />
            <RecipesClient recipes={recipesWithIds} user={user} heading="My Recipes" />
            <RecipesClient recipes={sharedRecipes} user={user} heading="Shared with me" />
            <BackToHomeButton />
        </Container>
    );
}
