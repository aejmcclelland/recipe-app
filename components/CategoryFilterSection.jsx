'use client';
import React from 'react';
import { Box } from '@mui/material';
import FilterCategory from '@/components/FilterCategory';

export default function CategoryFilterSection({ categories }) {
    return (
        <Box
            sx={{
                backgroundColor: '#ffffffff',
                borderBottom: '1px solid #ddd',
                py: 2,mb: 4,
            }}>
            <FilterCategory categories={categories} />
        </Box>
    );
}