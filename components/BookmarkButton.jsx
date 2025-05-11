'use client';
import FloatingIconButton from './FloatingIconButton';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { IconButton, Tooltip } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import checkBookmarkStatus from '@/app/actions/checkBookmarkStatus';
import bookmarkRecipe from '@/app/actions/bookmarkRecipe';
import { useSession } from 'next-auth/react';

const BookmarkButton = ({ recipe }) => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const recipeId = recipe?._id;
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check bookmark status on component mount
    useEffect(() => {
        const fetchBookmarkStatus = async () => {
            if (!userId || !recipeId) {
                setLoading(false);
                return;
            }

            try {
                const result = await checkBookmarkStatus(recipeId);
                if (result.success) {
                    setIsBookmarked(result.isBookmarked);
                }
            } catch (error) {
                console.error('Error checking bookmark status:', error);
                toast.error('Failed to check bookmark status. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarkStatus();
    }, [userId, recipeId]);

    // Toggle bookmark status
    const handleClick = async () => {
        if (!userId) {
            toast.error('Please log in to bookmark recipes!');
            return;
        }

        try {
            const result = await bookmarkRecipe(recipeId);
            if (result.success) {
                setIsBookmarked(result.isBookmarked);
                // Include the recipe name in the toast message
                const action = result.isBookmarked ? 'added to' : 'removed from';
                toast.success(`Recipe "${recipe.name}" ${action} your bookmarks.`);
            } else {
                toast.error('Unexpected error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            toast.error('Failed to toggle bookmark. Please try again.');
        }
    };

    if (loading) return null; // Optionally display a loader while loading

    return (
        <FloatingIconButton
            onClick={handleClick}
            icon={isBookmarked ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
            tooltip={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            color={isBookmarked ? 'green' : '#d32f2f'}
        />
    );
};

export default BookmarkButton;