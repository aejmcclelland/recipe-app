'use client';
import * as React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import CategoryFilter from './CategoryFilter';

export default function DrawerComponent({ handleDrawerToggle, onFilterChange }) {
    return (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Rebekah&#39;s Recipes!
            </Typography>
            <Divider />
            <CategoryFilter onFilterChange={onFilterChange} />
        </Box>
    );
}