import { IconButton } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { toast } from 'react-toastify';
import addBookmark from '@/app/actions/addBookmark';

export default function NoBookmark({ recipeId }) {
    const handleAddBookmark = async () => {
        try {
            await addBookmark(recipeId);
            toast.success('Bookmark added successfully!');
        } catch (error) {
            console.error('Failed to add bookmark:', error.message);
            toast.error('Failed to add bookmark. Please try again.');
        }
    };

    return (
        <IconButton
            onClick={handleAddBookmark}
            sx={{
                color: 'blue',
                fontSize: '2rem',
                padding: '12px',
            }}
        >
            <BookmarkBorderIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
    );
}