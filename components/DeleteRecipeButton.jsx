'use client';

import { IconButton, Tooltip } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import deleteRecipe from '@/app/actions/deleteRecipe';

const DeleteRecipeButton = ({ recipeId }) => {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this recipe?');
        if (!confirmed) return;

        setDeleting(true);
        try {
            await deleteRecipe(recipeId);
            router.push('/');
        } catch (err) {
            console.error('Error deleting recipe:', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Tooltip title="Delete Recipe">
            <IconButton
                onClick={handleDelete}
                sx={{
                    color: 'gray',
                    border: '1px solid',
                    borderColor: 'gray',
                    borderRadius: '50%',
                }}
                disabled={deleting}
            >
                <DeleteForeverOutlinedIcon />
            </IconButton>
        </Tooltip>
    );
};

export default DeleteRecipeButton;