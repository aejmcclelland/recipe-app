'use client';
import { Box, Divider, Typography } from '@mui/material';
import CategoryFilter from './CategoryFilter';

export default function DrawerComponent() {
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Rebekah&#39;s Recipes!
            </Typography>
            <Divider />
            <CategoryFilter />
        </Box>
    );
}