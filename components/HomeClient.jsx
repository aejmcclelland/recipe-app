// components/HomeClient.jsx
'use client';
import { useFilter } from '@/context/FilterContext';
import { useSearchParams } from 'next/navigation';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';

export default function HomeClient({ recipes }) {
    const { selectedCategory } = useFilter();

    // Filter recipes if a category is selected, otherwise show all
    const filteredRecipes = selectedCategory === 'All'
        ? recipes
        : recipes.filter(recipe => recipe.category?.name === selectedCategory);



    return (
        <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h2" align="center" gutterBottom>
                    Welcome to Rebekah&#39;s Recipes!
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                    We are working hard to bring you the best recipes. Please be patient as we add more recipes to our collection.
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                        <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                            <RecipeOverviewCard recipe={recipe} />
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1" align="center">
                        No recipes found for this category.
                    </Typography>
                )}
            </Grid>
        </Container>
    );
}