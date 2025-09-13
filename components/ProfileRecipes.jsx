'use client';

import { Box, Container, Button, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import deleteRecipe from '@/app/actions/deleteRecipe';

function ProfileRecipes({ recipes }) {
    const [likedRecipes, setLikedRecipes] = useState({});

    const handleLike = (recipeId) => {
        setLikedRecipes((prev) => ({
            ...prev,
            [recipeId]: !prev[recipeId],
        }));
    };

    const handleDelete = async (recipeId) => {
        await deleteRecipe(recipeId);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h4" gutterBottom>
                    My Recipes
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Grid container spacing={+4} justifyContent="center" alignItems="center">
                    {recipes.map((recipe) => (
                        <Grid item xs={+12} sm={+6} md={+4} key={recipe._id}>
                            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                                <Image
                                    src={recipe.image}
                                    alt={recipe.name}
                                    width={300}
                                    height={187}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                />
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    {recipe.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Category: {recipe.category?.name || 'No Category'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Cook Time: {recipe.cookTime}
                                </Typography>
                                {/* Stack with  Edit, and Delete buttons */}
                                <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center' }}>
                                    <Link href={`/recipes/${recipe._id}/edit`} passHref>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                minWidth: '70px',
                                                padding: '5px 10px',
                                                height: '36px', // Explicit height for consistency
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                        sx={{
                                            minWidth: '70px',
                                            padding: '5px 10px',
                                            height: '36px', // Explicit height for consistency
                                        }}
                                        onClick={() => handleDelete(recipe._id)}
                                    >
                                        Delete
                                    </Button>
                                </Stack>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
}

export default ProfileRecipes;