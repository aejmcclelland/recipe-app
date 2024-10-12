'use client';
import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Image from 'next/image';

export default function RecipeCard({ recipe }) {
    if (!recipe) {
        return <Typography variant="h6">No Recipe Found</Typography>;
    }

    return (
        <Card
            sx={{
                maxWidth: '100%',
                marginBottom: 2,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.4)', // Increased and softened shadow
            }}
        >
            <CardContent>
                <Grid container spacing={2}>
                    {/* Left Grid: Image and Ingredients */}
                    <Grid xs={12} md={6}>
                        {/* Recipe Image (Reduced size by 25%) */}
                        <Box mb={2}>
                            <Image
                                src={recipe.image}
                                alt={recipe.name}
                                width={300}  // Reduced width
                                height={187} // Adjusted height proportionally
                                className="w-full h-auto"
                                style={{ objectFit: 'cover' }}
                            />
                        </Box>

                        {/* Ingredients (Added padding to the left for better alignment) */}
                        <Box mt={2} sx={{ paddingLeft: 2 }}>
                            <Typography variant="h6">Ingredients:</Typography>
                            <ul>
                                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                    recipe.ingredients.map((ing, index) => (
                                        <li key={index}>
                                            {`${ing.ingredient?.name || 'Unknown Ingredient'}: ${ing.quantity || 'N/A'} ${ing.unit || ''}`}
                                        </li>
                                    ))
                                ) : (
                                    <Typography variant="body2">No Ingredients Found</Typography>
                                )}
                            </ul>
                        </Box>
                    </Grid>

                    {/* Right Grid: Recipe Method */}
                    <Grid xs={12} md={6}>
                        {/* Recipe Name */}
                        <Typography variant="h5" gutterBottom>
                            {recipe.name}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Method:
                        </Typography>
                        <Typography variant="body1">
                            {recipe.method || 'No method provided'}
                        </Typography>

                        {/* Additional Information like PrepTime, CookTime, Serves */}
                        <Box mt={2}>
                            <Typography variant="body2" color="text.secondary">
                                Prep Time: {recipe.prepTime ? `${recipe.prepTime} minutes` : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cook Time: {recipe.cookTime ? `${recipe.cookTime} minutes` : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Serves: {recipe.serves || 'N/A'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}