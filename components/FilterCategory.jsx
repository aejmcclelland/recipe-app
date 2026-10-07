import React from 'react';
import { Button, Box } from '@mui/material';
import { useFilter } from '@/context/FilterContext';

export default function CategoryFilter({ categories = [] }) {
    const { selectedCategory, onFilterChange } = useFilter();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center', // Vertically align buttons
                overflowX: 'auto', // Enable horizontal scrolling for smaller screens
                whiteSpace: 'nowrap', // Prevent buttons from wrapping
                gap: 1, // Add spacing between buttons
                py: 2,
                scrollBehavior: 'smooth', // Smooth scrolling
                WebkitOverflowScrolling: 'touch', // Enable momentum scrolling for iOS
                '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
            }}
        >
            {['All', ...(Array.isArray(categories) ? categories.map((cat) => cat?.name || '') : [])].map((category) => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? 'contained' : 'text'}
                    aria-pressed={selectedCategory === category}
                    onClick={() => onFilterChange(category)}
                    sx={{
                        px: 2,
                        minWidth: 'auto',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {category}
                </Button>
            ))}
        </Box>
    );
}
