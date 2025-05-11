'use client';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function WelcomeSection() {
    return (
        <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom>
                Start building your Recipe Collection
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Save, import, and organize recipes with ease — all securely stored and accessible anywhere.
            </Typography>
            <Link href="/recipes/signin" passHref>
                <Button variant="contained" size="large" sx={{ mt: 3 }}>
                    Sign up for free
                </Button>
            </Link>
        </Box>
    );
}