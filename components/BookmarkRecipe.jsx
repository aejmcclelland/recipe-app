'use client';

import { IconButton, Tooltip } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import addBookmark from '@/app/actions/addBookmark';
import deleteBookmark from '@/app/actions/deleteBookmark';


export default function BookmarkButton({ recipeId, user, initialBookmarked = false }) {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const router = useRouter();

    const toggleBookmark = async () => {
        if (!user || !user.id) {
            alert('Please log in or sign up to save recipes!');
            router.push('/recipes/signin');
            return;
        }

        try {
            if (isBookmarked) {
                await deleteBookmark(recipeId);
            } else {
                await addBookmark(recipeId);
            }
            setIsBookmarked(!isBookmarked);
        } catch (error) {
            console.error('Error toggling bookmark:', error.message);
            alert('Failed to update bookmark. Please try again.');
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