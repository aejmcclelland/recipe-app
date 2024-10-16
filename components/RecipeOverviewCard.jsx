'use client';
import * as React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Image from 'next/image';
import Link from 'next/link';


export default function RecipeOverviewCard({ recipe }) {
    console.log('log:', recipe);
    return (
        <Link href={`/recipes/${recipe._id}`} passHref>
            <Card sx={{ maxWidth: 400, marginBottom: 2, boxShadow: '2px 4px 20px 0px rgba(0, 0, 0, 0.2)', cursor: 'pointer' }}>
                <Image
                    src={recipe.image}
                    alt={recipe.name}
                    width={400}
                    height={250}
                    className="w-full h-auto"
                    style={{ objectFit: 'cover' }}
                />
                <CardContent>
                    <Typography variant="h5" component="div">
                        {recipe.name}
                    </Typography>
                    <IconButton aria-label="add to favorites">
                        <FavoriteIcon />
                    </IconButton>
                </CardContent>
            </Card>
        </Link>
    );
}