'use client';

import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { useFilter } from '@/context/FilterContext';

export default function RecipesClient({ recipes, user, heading }) {
    const { selectedCategory } = useFilter();

    // Filter recipes based on selectedCategory
    const filteredRecipes = selectedCategory === 'All'
        ? recipes
        : recipes.filter(recipe => recipe.category?.name === selectedCategory);

    return (
        <Box component="section" aria-label={heading} sx={{ mb: 4 }}>
            <Typography component="h2" variant="h4" align="center" sx={{ marginBottom: 2 }}>
                {heading || (selectedCategory === 'All' ? 'All Recipes' : `${selectedCategory} Recipes`)}
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                        <Grid key={recipe._id.toString()} size={{ xs: 12, sm: 6, md: 4 }}>
                            <RecipeOverviewCard
                                recipe={recipe}
                                user={user}
                                isBookmarked={user?.bookmarks?.some(
                                    (bookmark) => bookmark.toString() === recipe._id.toString()
                                )}
                            />
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1" align="center" sx={{ marginTop: 4 }}>
                        No recipes found for this category.
                    </Typography>
                )}
            </Grid>
        </Box>
    );
}
