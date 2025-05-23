// 'use server';
export const dynamic = 'force-dynamic';
import { Box, Container, Typography } from '@mui/material';
import connectDB from '@/config/database';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import defaultProfile from '@/assets/images/default-profile.png';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { serializeBookmarks } from '@/utils/serializeBookmarks';
import BookmarkRecipeCard from '@/components/BookmarkRecipeCard';
import UserDetails from '@/components/UserDetails';
import Category from '@/models/Category'; // ✅ Add this line near your other imports
import ProfileDetailsForm from '@/components/ProfileDetailsForm';

const ProfilePage = async () => {
    try {
        // Connect to the database
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

        const userDetails = {
            id: sessionUser.id,
            name: sessionUser.name || 'Unknown',
            email: sessionUser.email || '',
            image: sessionUser.image || defaultProfile,
        };

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

        // Serialize the recipes and bookmarks for client components
        const userRecipes = convertToSerializeableObject(recipesDocs);
        const userBookmarks = convertToSerializeableObject(userWithBookmarks);
        const bookmarkedRecipes = serializeBookmarks(userBookmarks?.bookmarks || []);

        // Render the profile page
        return (
            <Container maxWidth="lg">
                {/* User Details */}
                <UserDetails user={userDetails} />

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
                        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} // Single column for small screens, two columns for medium+
                        gap={4} // Larger gap between grid items
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