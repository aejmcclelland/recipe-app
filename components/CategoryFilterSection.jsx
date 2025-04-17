'use client';
import React from 'react';
import { Box } from '@mui/material';
import FilterCategory from '@/components/FilterCategory';

export default function CategoryFilterSection({ categories }) {
    return (
        <Box
            sx={{
                backgroundColor: '#f9f9f9',
                borderBottom: '1px solid #ddd',
                py: 2,
            }}>
            <FilterCategory categories={categories} />
        </Box>
    );
}