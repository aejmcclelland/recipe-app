// app/recipes/profile/page.jsx
export const dynamic = 'force-dynamic';

import { Box, Container, Typography } from '@mui/material';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { serializeBookmarks } from '@/utils/serializeBookmarks';
import BookmarkRecipeCard from '@/components/BookmarkRecipeCard';
import UserDetails from '@/components/UserDetails';
import { readableRecipeFilter } from '@/utils/recipeAccess';

const ProfilePage = async () => {
    let loadStatus = 'loading';
    let sessionUser;
    let profileUser;
    let userRecipes;
    let bookmarkedRecipes;

    try {
        await connectDB();

        sessionUser = await getSessionUser({ cache: 'no-store' });

        if (!sessionUser || !sessionUser.id) {
            console.warn('Session user is missing or invalid.');
            loadStatus = 'signed-out';
        } else {
            const userId = sessionUser.id;

            // Fetch fresh user details for the profile area (incl. email verification state)
            const userDoc = await User.findById(userId)
                .select('firstName lastName email emailVerified image')
                .lean();

            if (!userDoc) {
                loadStatus = 'missing-profile';
            } else {
                // Combined user object for the profile header + avatar + edit form.
                // (We keep sessionUser fields for anything not stored on the User doc.)
                profileUser = {
                    id: userId,
                    name: sessionUser.name || `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || 'Unknown',
                    firstName: userDoc.firstName || '',
                    lastName: userDoc.lastName || '',
                    email: userDoc.email || '',
                    emailVerified: !!userDoc.emailVerified,
                    image: sessionUser.image || userDoc.image || null,
                };

                // Fetch user's bookmarked recipes
                const userWithBookmarks = await User.findById(userId)
                    .populate({
                        path: 'bookmarks',
                        model: 'Recipe',
                        match: readableRecipeFilter(userId),
                        select: '-sharedWith',
                        populate: { path: 'category', select: 'name', model: 'Category' },
                    })
                    .lean();

                // Fetch user's own recipes
                const recipesDocs = await Recipe.find({ user: userId })
                    .populate({ path: 'category', select: 'name' })
                    .lean();

                userRecipes = convertToSerializeableObject(recipesDocs);
                const userBookmarks = convertToSerializeableObject(userWithBookmarks);
                bookmarkedRecipes = serializeBookmarks(userBookmarks?.bookmarks || []);
                loadStatus = 'success';
            }
        }
    } catch (error) {
        console.error('Error rendering profile page:', error);
        loadStatus = 'error';
    }

    if (loadStatus === 'signed-out') {
        return (
            <Container maxWidth="lg" disableGutters>
                <Typography component="h1" variant="h6">Please log in to access your profile.</Typography>
            </Container>
        );
    }

    if (loadStatus === 'missing-profile') {
        return (
            <Container maxWidth="lg" disableGutters>
                <Typography>Unable to load your profile details.</Typography>
            </Container>
        );
    }

    if (loadStatus === 'error') {
        return (
            <Container maxWidth="lg" disableGutters>
                <Typography>Something went wrong while loading your profile. Please try again later.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" disableGutters>
            <Typography component="h1" variant="h2" sx={{ mt: { xs: 1, md: 2 }, mb: 4 }}>Your profile</Typography>
            {/* Profile header + avatar + edit form */}
            <UserDetails user={profileUser} appearance="profile" />

            {/* User's Recipes */}
            <Box component="section" aria-labelledby="owned-recipes-heading" mt={5}>
                <Typography id="owned-recipes-heading" component="h2" variant="h4" sx={{ mb: 3 }}>Your Recipes</Typography>
                <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                    {userRecipes.map((recipe) => (
                        <Box key={recipe._id.toString()} sx={{ width: '100%', maxWidth: 400, minWidth: 0 }}>
                            <RecipeOverviewCard recipe={recipe} user={sessionUser} appearance="home" />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Bookmarked Recipes */}
            <Box component="section" aria-labelledby="bookmarked-recipes-heading" mt={5}>
                <Typography id="bookmarked-recipes-heading" component="h2" variant="h4" sx={{ mb: 3 }}>Bookmarked Recipes</Typography>
                <Box
                    display="grid"
                    gridTemplateColumns={{ xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }}
                    gap={4}
                >
                    {bookmarkedRecipes.length > 0 ? (
                        bookmarkedRecipes.map((recipe) => (
                            <BookmarkRecipeCard
                                key={recipe._id.toString()}
                                recipe={recipe}
                                user={sessionUser?.user}
                                isBookmarked
                                appearance="profile"
                            />
                        ))
                    ) : (
                        <Typography>You haven&apos;t saved any recipes yet.</Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );

};

export default ProfilePage;
