'use server';
import { Box, Container } from '@mui/material';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { redirect } from 'next/navigation';
import { Category } from '@/models/Category';

const ProfilePage = async () => {
    await connectDB();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.user.id) {
        redirect('/');
        return null;
    }

    const userId = sessionUser.user.id;

    const userWithBookmarks = await User.findById(userId)
        .populate({
            path: 'bookmarks',
            model: 'Recipe',
            populate: { path: 'category', select: 'name' },
        })
        .lean();

    const recipesDocs = await Recipe.find({ user: userId })
        .populate('category', 'name')
        .lean();

    const userRecipes = convertToSerializeableObject(recipesDocs);
    const userBookmarks = convertToSerializeableObject(userWithBookmarks);

    // Serialize bookmarks
    const bookmarkedRecipes = userBookmarks?.bookmarks.map((bookmark) => ({
        ...bookmark,
        _id: bookmark._id.toString(),
        category: bookmark.category
            ? { ...bookmark.category, _id: bookmark.category._id.toString() }
            : null,
    })) || [];

    return (
        <Container maxWidth="lg">
            <h2>Welcome, {userWithBookmarks?.firstName || 'Guest'}!</h2>
            <Box>
                <h3>Your Recipes</h3>
                <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                    {userRecipes.map((recipe) => (
                        <Box key={recipe._id.toString()} sx={{ maxWidth: 400 }}>
                            <RecipeOverviewCard recipe={recipe} user={sessionUser?.user} />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box mt={4}>
                <h3>Bookmarked Recipes</h3>
                <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                    {bookmarkedRecipes.length > 0 ? (
                        bookmarkedRecipes.map((recipe) => (
                            <Box key={recipe._id.toString()} sx={{ maxWidth: 400 }}>
                                <RecipeOverviewCard recipe={recipe} user={sessionUser?.user} isBookmarked />
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