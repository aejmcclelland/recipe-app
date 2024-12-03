'use client';

import { useFilter } from '@/context/FilterContext';
import { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';

export default function HomeClient({ recipes, user }) {
    const { selectedCategory } = useFilter();
    const [filteredRecipes, setFilteredRecipes] = useState([]);

    useEffect(() => {

        console.log('User in HomeClient:', user);
        console.log('Recipes in HomeClient:', recipes)
        const updatedRecipes = recipes.map((recipe) => ({
            ...recipe,
            _id: recipe._id.toString(), // Convert ObjectId to string
            isBookmarked: user?.bookmarks?.some((id) => id === recipe._id.toString()) || false,
        }));


        setFilteredRecipes(
            selectedCategory === 'All'
                ? updatedRecipes
                : updatedRecipes.filter((recipe) => recipe.category?.name === selectedCategory)
        );
    }, [selectedCategory, recipes, user]);
    return (
        <Container maxWidth="lg">
            <Grid container spacing={4} justifyContent="center">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                        <Grid xs={12} sm={6} md={4} key={recipe._id.toString()}>
                            <RecipeOverviewCard
                                recipe={recipe}
                                user={user}
                                isBookmarked={recipe.isBookmarked}
                            />
                        </Grid>
                    ))
                ) : (
                    <Box textAlign="center" mt={4}>
                        <Typography>No recipes found for this category.</Typography>
                    </Box>
                )}
            </Grid>
        </Container>
    );
}