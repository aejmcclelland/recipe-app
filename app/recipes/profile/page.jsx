'use server';
import { Box, Container } from '@mui/material';
import ProfileRecipes from '@/components/ProfileRecipes';
import { getSessionUser } from '@/utils/getSessionUser';
import connectDB from '@/config/database';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Recipe from '@/models/Recipe';
import { redirect } from 'next/navigation';

const ProfilePage = async () => {
    await connectDB();

    // Fetch session user
    const sessionUser = await getSessionUser();

    // Redirect to home if the user is not logged in
    if (!sessionUser || !sessionUser.userId) {
        redirect('/');
        return null;
    }

    const { userId, userName } = sessionUser;

    // Fetch recipes for the logged-in user
    const recipesDocs = await Recipe.find({ user: userId }).lean();
    const recipes = convertToSerializeableObject(recipesDocs);

    return (
        <Container maxWidth="lg">
            <h1>Welcome, {userName}</h1>
            <ProfileRecipes recipes={recipes} />
        </Container>
    );
};

export default ProfilePage;