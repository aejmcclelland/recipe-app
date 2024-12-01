import React from 'react';
import { Button, Box } from '@mui/material';
import { useFilter } from '@/context/FilterContext';

export default function CategoryFilter() {
    const { selectedCategory, onFilterChange } = useFilter();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center', // Center the buttons horizontally
                alignItems: 'center', // Vertically align buttons
                overflowX: 'auto', // Enable horizontal scrolling for smaller screens
                whiteSpace: 'nowrap', // Prevent buttons from wrapping
                gap: 1, // Add spacing between buttons
                padding: 2,
                scrollBehavior: 'smooth', // Smooth scrolling
                WebkitOverflowScrolling: 'touch', // Enable momentum scrolling for iOS
                '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
            }}
        >
            {['All', 'Beef', 'Chicken', 'Pasta', 'Vegetable', 'Fish', 'Pork', 'Other'].map((category) => (
                <Button
                    key={category}
                    variant="text"
                    onClick={() => onFilterChange(category)}
                    sx={{
                        textTransform: 'none', // Remove text capitalization
                        color: selectedCategory === category ? 'red' : 'black', // Change font color when selected
                        backgroundColor: 'white', // Ensure background color stays white
                        borderRadius: 0, // No rounded corners
                        padding: '0.5rem 1rem',
                        whiteSpace: 'nowrap', // Prevent text wrapping
                        transition: 'color 0.3s ease', // Smooth font color change
                        '&:hover': {
                            color: 'red', // Change font color only
                            backgroundColor: 'white', // Keep background white on hover
                        },
                        '&:focus': {
                            color: 'red', // Ensure focus matches hover/selected behavior
                            backgroundColor: 'white', // Keep background white on focus
                        },
                    }}
                >
                    {category}
                </Button>
            ))}
        </Box>
    );
}