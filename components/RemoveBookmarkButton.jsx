'use client';

import { IconButton } from '@mui/material';
import BookmarkRemoveTwoToneIcon from '@mui/icons-material/BookmarkRemoveTwoTone';
import { toast } from 'react-toastify';
import removeBookmark from '@/app/actions/deleteBookmark';

export default function RemoveBookmarkButton({ recipeId }) {
    const handleRemoveBookmark = async () => {
        try {
            await removeBookmark(recipeId); // Call the server action
            toast.success('Bookmark removed successfully!');
        } catch (error) {
            console.error('Failed to remove bookmark:', error.message);
            toast.error('Failed to remove bookmark. Please try again.');
        }
    };

    return (
        <IconButton
            onClick={handleRemoveBookmark}
            sx={{
                color: 'red',
                position: 'absolute',
                top: 10,
                right: 10,
            }}
        >
            <BookmarkRemoveTwoToneIcon />
        </IconButton>
    );
}