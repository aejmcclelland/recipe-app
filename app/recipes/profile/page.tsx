'use server';
import React from 'react';
import { Box, Container } from '@mui/material';
import ProfileRecipes from '@/components/ProfileRecipes';
import { getSessionUser } from '@/utils/getSessionUser';
import connectDB from '@/config/database';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Category from '@/models/Category';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { redirect } from 'next/navigation';
import mongoose from 'mongoose';


// Define types for Recipe and UserWithBookmarks
interface Recipe {
    _id: string;
    name: string;
    image: string;
    category?: { name: string };
    user?: { firstName: string };
}

interface UserWithBookmarks {
    _id: string;
    firstName: string;
    bookmarks: Recipe[];
}

const ProfilePage = async (): Promise<JSX.Element | null> => {
    await connectDB();

     // Debug: Check registered models
    console.log('Registered Models:', Object.keys(mongoose.models));

    // Fetch session user
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser?.user.id) {
        redirect('/');
        return null;
    }
    const userId = sessionUser.user.id;

    // Fetch user with bookmarks
   // Fetch user with bookmarks
const userWithBookmarks = await User.findById(userId)
    .populate({
        path: 'bookmarks',
        model: 'Recipe',
        populate: { path: 'category', model: 'Category', select: 'name' },
    })
    .lean<UserWithBookmarks | null>();

    // Fetch user's own recipes
    const recipesDocs = await Recipe.find({ user: userId })
        .populate('user', 'firstName')
        .populate('category', 'name')
        .lean();

    const userRecipes: Recipe[] = convertToSerializeableObject(recipesDocs);
    const bookmarkedRecipes: Recipe[] = convertToSerializeableObject(userWithBookmarks?.bookmarks || []);

    return (
        <Container maxWidth="lg">
            <h2>Welcome, {userWithBookmarks?.firstName || 'Guest'}!</h2>

            {/* User's Own Recipes */}
            <Box>
                <ProfileRecipes recipes={userRecipes} />
            </Box>

            {/* Bookmarked Recipes */}
            <Box mt={4}>
                <h3>Saved Recipes</h3>
                <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    justifyContent="center"
                    alignItems="center"
                >
                    {bookmarkedRecipes.length > 0 ? (
                        bookmarkedRecipes.map((recipe) => (
                            <Box key={recipe._id} sx={{ position: 'relative', maxWidth: 400 }}>
                                <RecipeOverviewCard recipe={recipe} showRemoveBookmark={true} />
                            </Box>
                        ))
                    ) : (
                        <p>You haven&apos;t saved any recipes yet.</p>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default ProfilePage;