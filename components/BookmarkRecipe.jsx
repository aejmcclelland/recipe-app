'use client';

import { IconButton, Tooltip } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import addBookmark from '../app/actions/addBookmark';
import deleteBookmark from '../app/actions/deleteBookmark';
import { toast } from 'react-toastify';

export default function BookmarkButton({ recipeId, recipeName, user, initialBookmarked = false }) {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const router = useRouter();

    useEffect(() => {
        console.log('User in BookmarkButton:', user);
    }, [user]);

    const toggleBookmark = async () => {

        if (!user || !user.id) {
            console.error('User not logged in or missing userId:', user);
            alert('Please log in or sign up to save recipes!');
            router.push('/recipes/signin');
            return;
        }

        try {
            if (isBookmarked) {
                // Call deleteBookmark if the recipe is already bookmarked
                const result = await deleteBookmark(recipeId);
                console.log('Result from deleteBookmark:', result);
                if (result?.success) {
                    setIsBookmarked(!isBookmarked);
                    toast[!isBookmarked ? 'success' : 'info'](
                        !isBookmarked ? 'Recipe bookmarked!' : 'Recipe removed from bookmarks.'
                    );
                }
            } else {
                // Call addBookmark if the recipe is not bookmarked
                const result = await addBookmark(recipeId, recipeName);
                console.log('Result from addBookmark:', result);
                if (result?.isBookmarked) {
                    setIsBookmarked(true); // Update state to reflect bookmark
                }
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error.message);
            alert('Failed to toggle bookmark. Please try again.');
        }
    };
    return (
        <Tooltip title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
            <IconButton
                onClick={toggleBookmark}
                sx={{
                    color: isBookmarked ? 'green' : 'gray',
                    border: '1px solid',
                    borderColor: isBookmarked ? 'green' : 'gray',
                    borderRadius: '50%',
                }}
            >
                {isBookmarked ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
            </IconButton>
        </Tooltip>
    );
}