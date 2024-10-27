'use server';
import { Box, Container, Button } from '@mui/material';
import ProfileRecipes from '@/components/ProfileRecipes';
import { getSessionUser } from '@/utils/getSessionUser';
import connectDB from '@/config/database';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Recipe from '@/models/Recipe';
import { redirect } from 'next/navigation';

const ProfilePage = async () => {
    await connectDB();
    const sessionUser = await getSessionUser();
    const { userId } = sessionUser;

    if (!userId) {
        throw new Error('User ID is required');
    }

    // Redirect to home if the user is not logged in
    if (!session) {
        redirect('/');
        return null;
    }

    const recipesDocs = await Recipe.find({ user: userId }).lean();
    const recipes = convertToSerializeableObject(recipesDocs);

    return (
        <Container maxWidth="lg">
            {/* <Box sx={{ textAlign: 'center', my: 4 }}>
                <h1>My Recipes</h1>
            </Box> */}
            <h1>Welcome, {session.user.name}</h1>
            <ProfileRecipes recipes={recipes} />
        </Container>
    );


}

export default ProfilePage;