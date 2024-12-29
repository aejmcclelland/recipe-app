// 'use server';
export const dynamic = 'force-dynamic';
import { Box, Container } from '@mui/material';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { serializeBookmarks } from '@/utils/serializeBookmarks';
import mongoose from 'mongoose';

const ProfilePage = async () => {
    try {
        // Connect to the database
        await connectDB();

        const sessionUser = await getSessionUser({ cache: 'no-store' });

        console.log('Session User in Profile Page:', sessionUser);

        if (!sessionUser || !sessionUser.user?.id) {
            console.warn('Session user is missing or invalid.');
            return (
                <Container maxWidth="lg">
                    <h2>Please log in to access your profile.</h2>
                </Container>
            );
        }

        const userId = sessionUser.user.id;

        // Fetch user's bookmarked recipes
        const userWithBookmarks = await User.findById(userId)
            .populate({
                path: 'bookmarks',
                model: 'Recipe',
                populate: { path: 'category', select: 'name', model: 'Category', },
            })
            .lean();

        // Fetch user's own recipes
        const recipesDocs = await Recipe.find({ user: userId })
            .populate({ path: 'category', select: 'name' }) // Default inferred model (Category)
            .lean();

        // Debugging user's recipes
        console.log('User Recipes:', recipesDocs);

        // Serialize the recipes and bookmarks for client components
        const userRecipes = convertToSerializeableObject(recipesDocs);
        const userBookmarks = convertToSerializeableObject(userWithBookmarks);
        const bookmarkedRecipes = serializeBookmarks(userBookmarks?.bookmarks || []);

        // Render the profile page
        return (
            <Container maxWidth="lg">
                <h2>Welcome, {userWithBookmarks?.firstName || 'Guest'}!</h2>

                {/* User's Recipes */}
                <Box mt={4}>
                    <h3>Your Recipes</h3>
                    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                        {userRecipes.map((recipe) => (
                            <Box key={recipe._id.toString()} sx={{ maxWidth: 400 }}>
                                <RecipeOverviewCard recipe={recipe} user={sessionUser?.user} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Bookmarked Recipes */}
                <Box mt={4}>
                    <h3>Bookmarked Recipes</h3>
                    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                        {bookmarkedRecipes.length > 0 ? (
                            bookmarkedRecipes.map((recipe) => (
                                <Box key={recipe._id.toString()} sx={{ maxWidth: 400 }}>
                                    <RecipeOverviewCard
                                        recipe={recipe}
                                        user={sessionUser}
                                        isBookmarked
                                    />
                                </Box>
                            ))
                        ) : (
                            <p>You haven&apos;t saved any recipes yet.</p>
                        )}
                    </Box>
                </Box>
            </Container>
        );
    } catch (error) {
        console.error('Error rendering profile page:', error);
        return (
            <Container maxWidth="lg">
                <p>Something went wrong while loading your profile. Please try again later.</p>
            </Container>
        );
    }
};

export default ProfilePage;