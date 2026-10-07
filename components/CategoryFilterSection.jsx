'use client';
import React from 'react';
import { Box } from '@mui/material';
import FilterCategory from '@/components/FilterCategory';

export default function CategoryFilterSection({ categories }) {
    return (
        <Box
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                mb: 4,
            }}>
            <FilterCategory categories={categories} />
        </Box>
    );
}
