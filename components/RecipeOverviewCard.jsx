'use client';
import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import RemoveBookmarkButton from './RemoveBookmarkButton'; // Ensure this path is correct

export default function RecipeOverviewCard({ recipe }) {
    return (
        <Link href={`/recipes/${recipe._id}`} passHref>
            <Card
                sx={{
                    maxWidth: 400,
                    marginBottom: 2,
                    boxShadow: '2px 4px 20px 0px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    cursor: 'pointer',
                }}
            >
                {/* Recipe Image */}
                <Image
                    src={recipe.image}
                    alt={recipe.name}
                    width={400}
                    height={250}
                    style={{ objectFit: 'cover' }}
                />

                {/* Recipe Content */}
                <CardContent>
                    <Typography variant="h5" component="div">
                        {recipe.name}
                    </Typography>

                    {/* Remove Bookmark Icon */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 10, // Positioned at the bottom
                            right: 10, // Positioned to the right
                        }}
                    >
                        <RemoveBookmarkButton recipeId={recipe._id} />
                    </Box>
                </CardContent>
            </Card>
        </Link>
    );
}