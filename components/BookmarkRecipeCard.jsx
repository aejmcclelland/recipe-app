'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';

export default function BookmarkRecipeCard({ recipe, user, isBookmarked }) {
    if (!recipe) return null; // Handle edge case where recipe is undefined

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
            }}
        >
            {/* Recipe Image */}
            <Box
                sx={{
                    flex: '1 1 33%',
                    position: 'relative',
                    height: { xs: 200, sm: 'auto' },
                }}
            >
                <Link href={`/recipes/${recipe._id}`} passHref>
                    <Image
                        src={recipe.image}
                        alt={recipe.name}
                        fill
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
                }}
            >
                <Box>
                    <Typography variant="h6" noWrap>
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
                    />
                </Box>
            </CardContent>
        </Card>
    );
}