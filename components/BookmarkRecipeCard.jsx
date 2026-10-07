'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';

export default function BookmarkRecipeCard({ recipe, user, isBookmarked, appearance = 'default' }) {
    if (!recipe) return null; // Handle edge case where recipe is undefined
    const isProfile = appearance === 'profile';

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' }, // Adjust layout based on screen size
                width: '100%',
                maxWidth: 600,
                borderRadius: 2,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                ...(isProfile && {
                    minWidth: 0,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    boxShadow: 'none',
                }),
            }}
        >
            {/* Recipe Image */}
            <Box
                sx={{
                    position: 'relative',
                    flex: { xs: '0 0 auto', sm: '1 1 33%' },
                    width: '100%',
                    height: { xs: 200, sm: 250 },
                    overflow: 'hidden',
                    ...(isProfile && { flex: { xs: '0 0 auto', sm: '0 0 33%' }, minWidth: 0 }),
                }}
            >
                <Link href={`/recipes/${recipe._id}`} passHref
                    style={isProfile ? { display: 'block', position: 'relative', height: '100%', outlineOffset: -3 } : undefined}>
                    <Image
                        src={recipe.image}
                        alt={recipe.name}
                        fill={true}
                        sizes={isProfile ? '(max-width: 639px) calc(100vw - 32px), (max-width: 1199px) 16vw, 185px' : '(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw'}
                        quality={75}
                        style={{
                            objectFit: 'cover',
                            height: '100%',
                        }}
                    />
                </Link>
            </Box>

            {/* Recipe Details */}
            <CardContent
                sx={{
                    flex: '1 1 67%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 2,
                    ...(isProfile && { minWidth: 0, '&:last-child': { pb: 2 } }),
                }}
            >
                <Box>
                    <Typography variant="h6" component={isProfile ? 'h3' : undefined} noWrap sx={isProfile ? { fontSize: '1.1rem', fontWeight: 600 } : undefined}>
                        {recipe.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {recipe.category?.name || 'Uncategorized'}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        marginTop: 2,
                    }}
                >
                    <BookmarkButton
                        recipe={recipe}
                        user={user}
                        initialBookmarked={isBookmarked}
                        appearance={isProfile ? 'home' : 'default'}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}
