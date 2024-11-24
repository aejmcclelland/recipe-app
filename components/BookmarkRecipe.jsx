'use client';

import { IconButton, Typography, Box } from '@mui/material';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import saveRecipe from '@/app/actions/saveRecipe';

export default function BookmarkRecipe({ recipeId, user }) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const router = useRouter();

    // Initialize bookmarked state based on user data
    useEffect(() => {
        if (user && user.bookmarks) {
            const bookmarked = user.bookmarks.some(
                (bookmark) => bookmark.toString() === recipeId
            );
            setIsBookmarked(bookmarked);
        }
    }, [user, recipeId]);

    const handleBookmark = async () => {
        // Ensure user is logged in
        if (!user || !user.id) {
            alert('Please log in or sign up to save recipes!');
            router.push('/recipes/signin');
            return;
        }

        try {
            const result = await saveRecipe(recipeId);
            if (result?.isBookmarked !== undefined) {
                setIsBookmarked(result.isBookmarked);
            } else {
                throw new Error('Unexpected server response');
            }
        } catch (error) {
            console.error('Error saving recipe:', error.message);
            alert('Failed to save the recipe. Please try again.');
        }
    };

    return (
        <Box textAlign="center" mt={2}>
            <IconButton
                onClick={handleBookmark}
                sx={{
                    color: isBookmarked ? 'green' : 'gray',
                    border: '1px solid',
                    borderColor: isBookmarked ? 'green' : 'gray',
                    borderRadius: '50%',
                }}
            >
                {isBookmarked ? <BookmarksIcon /> : <BookmarksOutlinedIcon />}
            </IconButton>
            <Typography variant="body2">
                {isBookmarked ? 'Saved' : 'Save this recipe'}
            </Typography>
        </Box>
    );
}