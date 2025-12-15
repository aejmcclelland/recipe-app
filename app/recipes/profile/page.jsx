// app/recipes/profile/page.jsx
export const dynamic = 'force-dynamic';

import { Box, Container, Typography } from '@mui/material';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import defaultProfile from '@/public/images/default-profile.png';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { serializeBookmarks } from '@/utils/serializeBookmarks';
import BookmarkRecipeCard from '@/components/BookmarkRecipeCard';
import UserDetails from '@/components/UserDetails';

const ProfilePage = async () => {
    try {
        await connectDB();

        const sessionUser = await getSessionUser({ cache: 'no-store' });

        if (!sessionUser || !sessionUser.id) {
            console.warn('Session user is missing or invalid.');
            return (
                <Container maxWidth="lg">
                    <h2>Please log in to access your profile.</h2>
                </Container>
            );
        }

        const userId = sessionUser.id;

        // Fetch fresh user details for the profile area (incl. email verification state)
        const userDoc = await User.findById(userId)
            .select('firstName lastName email emailVerified image')
            .lean();

        if (!userDoc) {
            return (
                <Container maxWidth="lg">
                    <p>Unable to load your profile details.</p>
                </Container>
            );
        }

        // Combined user object for the profile header + avatar + edit form.
        // (We keep sessionUser fields for anything not stored on the User doc.)
        const profileUser = {
            id: userId,
            name: sessionUser.name || `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || 'Unknown',
            firstName: userDoc.firstName || '',
            lastName: userDoc.lastName || '',
            email: userDoc.email || '',
            emailVerified: !!userDoc.emailVerified,
            image: sessionUser.image || userDoc.image || defaultProfile?.src || defaultProfile,
        };

        // Fetch user's bookmarked recipes
        const userWithBookmarks = await User.findById(userId)
            .populate({
                path: 'bookmarks',
                model: 'Recipe',
                populate: { path: 'category', select: 'name', model: 'Category' },
            })
            .lean();

        // Fetch user's own recipes
        const recipesDocs = await Recipe.find({ user: userId })
            .populate({ path: 'category', select: 'name' })
            .lean();

        const userRecipes = convertToSerializeableObject(recipesDocs);
        const userBookmarks = convertToSerializeableObject(userWithBookmarks);
        const bookmarkedRecipes = serializeBookmarks(userBookmarks?.bookmarks || []);

        return (
            <Container maxWidth="lg">
                {/* Profile header + avatar + edit form */}
                <UserDetails user={profileUser} />

                {/* User's Recipes */}
                <Box mt={4}>
                    <h3>Your Recipes</h3>
                    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                        {userRecipes.map((recipe) => (
                            <Box key={recipe._id.toString()} sx={{ maxWidth: 400 }}>
                                <RecipeOverviewCard recipe={recipe} user={sessionUser} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Bookmarked Recipes */}
                <Box mt={4}>
                    <h3>Bookmarked Recipes</h3>
                    <Box
                        display="grid"
                        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                        gap={4}
                    >
                        {bookmarkedRecipes.length > 0 ? (
                            bookmarkedRecipes.map((recipe) => (
                                <BookmarkRecipeCard
                                    key={recipe._id.toString()}
                                    recipe={recipe}
                                    user={sessionUser?.user}
                                    isBookmarked
                                />
                            ))
                        ) : (
                            <Typography>You haven&apos;t saved any recipes yet.</Typography>
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
