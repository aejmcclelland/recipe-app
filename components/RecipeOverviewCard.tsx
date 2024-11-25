'use client';
import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import Link from 'next/link';
import RemoveBookmarkButton from '../components/RemoveBookmarkButton';

// Define the type for the recipe prop
interface Recipe {
    _id: string;
    name: string;
    image: string;
}

interface RecipeOverviewCardProps {
    recipe: Recipe;
    showRemoveBookmark?: boolean; // New optional prop
}

export default function RecipeOverviewCard({
    recipe,
    showRemoveBookmark = false, // Default value is false
}: RecipeOverviewCardProps): JSX.Element {
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
                    <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        wrap="nowrap" // Prevents wrapping
                        spacing={1}
                    >
                        {/* Recipe Name */}
                        <Grid
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Typography variant="h6" component="div" noWrap>
                                {recipe.name}
                            </Typography>
                        </Grid>
                        {/* Conditionally Render Remove Bookmark Button */}
                        {showRemoveBookmark && (
                            <Grid>
                                <RemoveBookmarkButton recipeId={recipe._id} />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        </Link>
    );
}