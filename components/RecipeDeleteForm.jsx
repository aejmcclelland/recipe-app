'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, Box } from '@mui/material';
import deleteRecipe from '@/app/actions/deleteRecipe';
import Grid from '@mui/material/Grid';

function RecipeDeleteForm({ recipe }) {
    const [isDeleted, setIsDeleted] = useState(false);
    const router = useRouter();

    const handleDeleteRecipe = async (recipeId) => {
        console.log('Delete button clicked'); // Check if the button click is registered
        const confirmed = window.confirm('Are you sure you want to delete this recipe?');

        if (!confirmed) return;

        try {
            // Convert recipeId to a string before passing to deleteRecipe
            await deleteRecipe(recipe._id.toString());
            setIsDeleted(true);
            console.log('Recipe deleted successfully');
            router.push('/'); // Redirect to home page after successful deletion
        } catch (error) {
            console.error('Failed to delete recipe:', error);
        }
    };

    if (isDeleted) {
        return (
            <Typography sx={{ mt: 2 }} variant="h6" color="success">
                The recipe has been deleted.
            </Typography>
        );
    }

    return (
        <Grid container spacing={3}>

            <Box display="flex" justifyContent="flex-end">
                <Button
                    onClick={handleDeleteRecipe} // Use onClick instead of passing recipeId
                    variant="contained"
                    color="error"
                    sx={{ ml: 2 }}
                    type='button'
                >
                    Delete Recipe
                </Button>
            </Box>

        </Grid>
    );
}

export default RecipeDeleteForm;