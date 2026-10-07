// components/RecipeOverviewCard.jsx

'use client';

import { Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';

export default function RecipeOverviewCard({ recipe, user, isBookmarked, appearance = 'default' }) {
    if (!recipe) return null; // Handle edge case where recipe is undefined
    const isHome = appearance === 'home';

    return (
        <Card
            data-testid={isHome ? 'home-recipe-card' : undefined}
            sx={isHome ? {
                width: '100%',
                maxWidth: 400,
                mb: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                boxShadow: 'none',
                position: 'relative',
            } : {
                maxWidth: 400,
                marginBottom: 2,
                boxShadow: '2px 4px 20px 0px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                cursor: 'pointer',
            }}
        >
            {/* Ensure dynamic href resolves correctly */}
            <Link href={`/recipes/${recipe._id}`} passHref style={isHome ? { display: 'block' } : undefined}>
                <Image
                    src={recipe.image}
                    alt={recipe.name}
                    width={400}
                    height={250}
                    sizes={isHome ? '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw' : undefined}
                    style={isHome
                        ? { display: 'block', width: '100%', height: 'auto', aspectRatio: '8 / 5', objectFit: 'cover' }
                        : { objectFit: 'cover' }}
                />
            </Link>
            <CardContent sx={isHome ? { p: 2.5, '&:last-child': { pb: 2.5 } } : undefined}>
                <Grid container alignItems="center" justifyContent="space-between" wrap={isHome ? 'nowrap' : undefined} sx={isHome ? { gap: 1 } : undefined}>
                    <Typography variant="h6" component={isHome ? 'h3' : undefined} noWrap sx={isHome ? { minWidth: 0, flex: 1, fontSize: '1.1rem', fontWeight: 600 } : undefined}>
                        {recipe.name}
                    </Typography>
                    {/* Pass the entire recipe object to BookmarkButton */}
                    <BookmarkButton
                        recipe={recipe}
                        user={user}
                        initialBookmarked={isBookmarked}
                        appearance={appearance}
                    />
                </Grid>
            </CardContent>
        </Card>
    );
}
