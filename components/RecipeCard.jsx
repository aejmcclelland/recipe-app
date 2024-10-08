'use client';
import * as React from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import Image from 'next/image';

export default function RecipeCard({ recipe }) {
    // Check if recipe exists before rendering
    if (!recipe) {
        return <Typography variant="h6">No Recipe Found</Typography>;
    }

    return (
        <Card sx={{ maxWidth: 400, marginBottom: 2 }}>
            <CardContent>
                <Image
                    src={recipe.image} // This will be the image URL stored in MongoDB
                    alt={recipe.name}
                    width={400}
                    height={250}
                    className="w-full h-auto"
                    style={{ objectFit: 'cover' }} // Ensures the image fits the card properly
                />
                <Typography variant="h5" component="div" gutterBottom>
                    {recipe.name || 'Unknown Recipe'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Prep Time: {recipe.prepTime ? `${recipe.prepTime} minutes` : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Cook Time: {recipe.cookTime ? `${recipe.cookTime} minutes` : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Serves: {recipe.serves || 'N/A'}
                </Typography>
                <Box mt={2}>
                    <Typography variant="h6">Ingredients:</Typography>
                    <List dense>
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                            recipe.ingredients.map((ing, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`${ing.ingredient?.name || 'Unknown Ingredient'}: ${ing.quantity || 'N/A'} ${ing.unit || ''}`}
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2">No Ingredients Found</Typography>
                        )}
                    </List>
                </Box>
                <Box mt={2}>
                    <Typography variant="h6">Method:</Typography>
                    <Typography variant="body2">{recipe.method || 'No method provided'}</Typography>
                </Box>
            </CardContent>
        </Card>
    );
}