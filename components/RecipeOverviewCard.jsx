'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkRecipe';

export default function RecipeOverviewCard({ recipe, user, isBookmarked }) {
    return (
        <Card
            sx={{
                maxWidth: 400,
                marginBottom: 2,
                boxShadow: '2px 4px 20px 0px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                cursor: 'pointer',
            }}
        >
            {/* Ensure dynamic href resolves correctly */}
            <Link href={`/recipes/${recipe._id.toString()}`} passHref>
                <Image
                    src={recipe.image}
                    alt={recipe.name}
                    width={400}
                    height={250}
                    style={{ objectFit: 'cover' }}
                />
            </Link>
            <CardContent>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" noWrap>
                        {recipe.name}
                    </Typography>
                    <BookmarkButton
                        recipeId={recipe._id.toString()}
                        user={user}
                        initialBookmarked={isBookmarked}
                    />
                </Grid>
            </CardContent>
        </Card>
    );
}