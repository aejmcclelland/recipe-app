'use server';
import { Box, Container } from '@mui/material';
import ProfileRecipes from '@/components/ProfileRecipes';
import { getSessionUser } from '@/utils/getSessionUser';
import connectDB from '@/config/database';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import RemoveBookmarkButton from '@/components/RemoveBookmarkButton';
import { redirect } from 'next/navigation';

const ProfilePage = async () => {
    await connectDB();

    // Fetch session user
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser?.user.id) {
        redirect('/');
        return null;
    }

    const userId = sessionUser.user.id;

    const userWithBookmarks = await User.findById(userId)
        .populate({
            path: 'bookmarks',
            model: 'Recipe',
            populate: { path: 'category', model: 'Category', select: 'name' },
        })
        .lean();

    const recipesDocs = await Recipe.find({ user: userId })
        .populate('user', 'firstName')
        .populate('category', 'name')
        .lean();

    const userRecipes = convertToSerializeableObject(recipesDocs);
    const bookmarkedRecipes = convertToSerializeableObject(userWithBookmarks?.bookmarks || []);

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
                                <RecipeOverviewCard recipe={recipe} />
                                <RemoveBookmarkButton recipeId={recipe._id} />
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