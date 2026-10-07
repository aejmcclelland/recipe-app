import RecipeAddForm from '@/components/RecipeAddForm';
import { getCategories } from '@/app/actions/getCategories';
import { Box, Typography } from '@mui/material';
import NextLink from 'next/link';

export default async function AddRecipePage() {
    const categories = await getCategories();

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: { xs: 2, md: 4 } }}>
            <NextLink href='/' style={{ textDecoration: 'none' }}>
                <Typography component='span' color='text.secondary' sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, mb: 2, '&:hover': { textDecoration: 'underline' } }}>
                    Back to Home
                </Typography>
            </NextLink>
            <Typography variant='h2' component='h1' gutterBottom>
                Add a Recipe
            </Typography>
            <Typography color='text.secondary' sx={{ mb: 4 }}>
                Fill in the details to add your recipe.
            </Typography>
            <RecipeAddForm categories={categories} />
        </Box>
    );
}
