'use client';
import * as React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Image from 'next/image';

export default function RecipeOverviewCard({ recipe }) {
    console.log('log:', recipe);
    return (
        <Card sx={{ maxWidth: 400, marginBottom: 2 }}>
            <Image
                src={recipe.image} // This will be the image URL stored in MongoDB
                alt={recipe.name}
                width={400}
                height={250}
                className="w-full h-auto"
                style={{ objectFit: 'cover' }} // Ensures the image fits the card properly
            />
            <CardContent>
                <Typography variant="h5" component="div">
                    {recipe.name}
                </Typography>
                {/* Like button */}
                <IconButton aria-label="add to favorites">
                    <FavoriteIcon />
                </IconButton>
            </CardContent>
        </Card>
    );
}