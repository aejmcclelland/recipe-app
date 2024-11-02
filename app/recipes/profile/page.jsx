'use server';
import { Box, Container } from '@mui/material';
import ProfileRecipes from '@/components/ProfileRecipes';
import { getSessionUser } from '@/utils/getSessionUser';
import connectDB from '@/config/database';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
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

    const { userId } = sessionUser;


    const user = await User.findById(userId).lean();
    const userName = user ? `${user.firstName}! ` : 'Guest';

    // Fetch recipes for the logged-in user, including user details
    const recipesDocs = await Recipe.find({ user: userId })
        .populate('user', 'firstName') // Populates the user field with specific details
        .lean();
    const recipes = convertToSerializeableObject(recipesDocs);

    return (
        <Container maxWidth="lg">
            <h2>Welcome, {userName}</h2>
            <ProfileRecipes recipes={recipes} />
        </Container>
    );
};

export default ProfilePage;