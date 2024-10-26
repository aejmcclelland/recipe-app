'use server';
import { Box, Container, Button } from '@mui/material';
import Image from 'next/image';
import ProfileRecipes from '@/components/ProfileRecipes';
import { getSessionUser } from '@/utils/getSessionUser';
import connectDB from '@/config/database';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Recipe from '@/models/Recipe';

const ProfilePage = async () => {
    await connectDB();
    const sessionUser = await getSessionUser();
    const { userId } = sessionUser;

    if (!userId) {
        throw new Error('User ID is required');
    }

    const recipesDocs = await Recipe.find({ user: userId }).lean();
    const recipes = convertToSerializeableObject(recipesDocs);

    return (
        <Container maxWidth="lg">
            {/* <Box sx={{ textAlign: 'center', my: 4 }}>
                <h1>My Recipes</h1>
            </Box> */}
            <ProfileRecipes recipes={recipes} />
        </Container>
    );


}

export default ProfilePage;