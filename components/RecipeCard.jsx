// components/RecipeCard.jsx
'use client';
import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image';
import { pluraliseUnit } from '@/utils/pluraliseUnit';

export default function RecipeCard({ recipe }) {
    if (!recipe) {
        return <Typography variant="h6">No Recipe Found</Typography>;
    }

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
                                loading='eager'
                                style={{ objectFit: 'cover' }}
                            />
                        </Box>

                        {/* Ingredients */}
                        <Box mt={2} sx={{ paddingLeft: 2 }}>
                            <Typography variant="h6">Ingredients:</Typography>
                            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                                <ul>
                                    {recipe.ingredients.map((ing, index) => {
                                        const name = ing?.ingredient?.name ?? 'Unknown Ingredient';
                                        const quantity = ing?.quantity;
                                        const unit = ing?.unit === 'other' ? ing?.customUnit : ing?.unit;

                                        // Hide legacy placeholder values that were previously injected for scraped recipes
                                        const isLegacyDefault = quantity === 1 && unit === 'unit';

                                        // No meaningful quantity/unit -> just show the ingredient name
                                        if (quantity == null || isLegacyDefault) {
                                            return <li key={index}>{name}</li>;
                                        }

                                        // Quantity but no unit -> "2 chicken"
                                        if (!unit) {
                                            return (
                                                <li key={index}>
                                                    {quantity} {name}
                                                </li>
                                            );
                                        }

                                        // Quantity + unit -> pluralised correctly
                                        return (
                                            <li key={index}>
                                                {quantity} {name} {pluraliseUnit(unit, quantity)} 
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <Typography variant="body2">No Ingredients Found</Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Right Section: Recipe steps */}
                    <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                            Steps:
                        </Typography>
                        {Array.isArray(recipe.steps) ? (
                            <Box component="ol" sx={{ pl: 3 }}>
                                {recipe.steps.map((step, index) => (
                                    <li key={index}>
                                        {step}
                                    </li>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No steps provided
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