// components/RecipesClient.jsx
'use client';

import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { useFilter } from '@/context/FilterContext';

export default function RecipesClient({ recipes }) {
    const { selectedCategory } = useFilter();

    console.log('Rendering RecipesClient with selectedCategory:', selectedCategory);


    // Filter recipes based on selectedCategory
    const filteredRecipes = selectedCategory === 'All'
        ? recipes
        : recipes.filter(recipe => recipe.category.name === selectedCategory);

    return (
        <Box>
            <Typography variant="h4">
                {selectedCategory === 'All' ? 'All Recipes' : `${selectedCategory} Recipes`}
            </Typography>
            <Grid container spacing={4}>
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                            <RecipeOverviewCard recipe={recipe} />
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1">No recipes found for this category</Typography>
                )}
            </Grid>
        </Box>
    );
}