'use client';
import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image';

export default function RecipeCard({ recipe }) {
    if (!recipe) {
        return <Typography variant="h6">No Recipe Found</Typography>;
    }

    // Log ingredients array specifically
    console.log('Recipe ingredients:', JSON.stringify(recipe.ingredients, null, 2));
    return (
        <Card
            sx={{
                maxWidth: '100%',
                marginBottom: 2,
                boxShadow: '4px 4px 20px 0px rgba(0, 0, 0, 0.2)', // Increased and softened shadow
            }}
        >
            <CardContent>
                <Box display="flex" flexDirection={{ mobile: 'column', laptop: 'row' }} gap={2}>
                    {/* Left Section: Image and Ingredients */}
                    <Box flex={1}>
                        {/* Recipe Image */}
                        <Box mb={2} display="flex" justifyContent="center">
                            <Image
                                src={recipe.image || 'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png'} // Provide a default image URL
                                alt={recipe.name || 'Recipe Image'}
                                width={300}
                                height={187}
                                className="w-full h-auto"
                                style={{ objectFit: 'cover' }}
                            />
                        </Box>

                        {/* Ingredients */}
                        <Box mt={2} sx={{ paddingLeft: 2 }}>
                            <Typography variant="h6">Ingredients:</Typography>
                            <ul>
                                {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
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
                    </Box>

                    {/* Right Section: Recipe Method */}
                    <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                            Method:
                        </Typography>
                        {Array.isArray(recipe.method) ? (
                            <Box component="ol" sx={{ pl: 3 }}>
                                {recipe.method.map((step, index) => (
                                    <li key={index}>
                                        {step}
                                    </li>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2">
                                {recipe.method || 'No method provided'}
                            </Typography>
                        )}

                        {/* Additional Information */}
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
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}