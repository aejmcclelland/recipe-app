'use client';

import { IconButton, Tooltip } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import addBookmark from '@/app/actions/addBookmark';


export default function BookmarkButton({ recipeId, user, initialBookmarked = false }) {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const router = useRouter();

    useEffect(() => {
        console.log('User in BookmarkButton:', user);
    }, [user]);

    const toggleBookmark = async () => {
        console.log('User in toggleBookmark:', user); // Confirm user here
        console.log('Recipe ID in toggleBookmark:', recipeId); // Confirm recipeId

        if (!user || !user.id) {
            console.error('User not logged in:', user);
            alert('Please log in or sign up to save recipes!');
            router.push('/recipes/signin');
            return;
        }

        try {
            const result = await addBookmark(recipeId); // Or equivalent fetch API call
            console.log('Result from addBookmark:', result);

            if (result?.isBookmarked) {
                setIsBookmarked(true);
            } else {
                setIsBookmarked(false);
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