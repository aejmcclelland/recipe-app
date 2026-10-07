'use client';
import { Box, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import Link from 'next/link';

import { useSession } from 'next-auth/react';

export default function Hero() {
    const { data: session } = useSession();

    if (!session) return null;
    return (
        <Box sx={{ py: { xs: 3, sm: 5 } }}>
            <Typography component="h2" variant="h4" align="center" gutterBottom>
                Get started with your personal recipe collection
            </Typography>
            <Grid container spacing={4} justifyContent="center" mt={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', borderRadius: 3 }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Typography component="h3" variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Copy & Paste from the Web</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Quickly import recipes from your favorite sites like BBC Good Food and Jamie Oliver.
                            </Typography>
                            <Link href="/recipes/copyWeb" passHref>
                                <Button variant="contained">Get a Recipe</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', borderRadius: 3 }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Typography component="h3" variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Add Manually</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Write your own recipes with full control over ingredients and steps.
                            </Typography>
                            <Link href="/recipes/add" passHref>
                                <Button variant="outlined">Add a Recipe</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
