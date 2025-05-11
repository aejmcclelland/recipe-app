'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FloatingIconButton from './FloatingIconButton';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
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
        <FloatingIconButton
            onClick={handleDelete}
            icon={<DeleteForeverOutlinedIcon />}
            tooltip="Delete Recipe"
        />
    );
};

export default DeleteRecipeButton;