'use client';
import { Button, Box } from '@mui/material';
import { useFilter } from '@/context/FilterContext';

export default function CategoryFilter() {
    const { onFilterChange } = useFilter();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2, // Adds vertical spacing between buttons (16px)
                mt: 2, // Adds top margin
                p: 2, // Adds padding around the buttons
                width: '100%', // Ensures full width
            }}
        >
            <Button

                fullWidth
                onClick={() => onFilterChange('All')}
                sx={{ textTransform: 'none' }} // Optional: Remove button text capitalization
            >
                All
            </Button>
            <Button

                fullWidth
                onClick={() => onFilterChange('Beef')}
                sx={{ textTransform: 'none' }} // Optional: Remove button text capitalization
            >
                Beef
            </Button>
            <Button

                fullWidth
                onClick={() => onFilterChange('Chicken')}
                sx={{ textTransform: 'none' }}
            >
                Chicken
            </Button>
            <Button

                fullWidth
                onClick={() => onFilterChange('Pasta')}
                sx={{ textTransform: 'none' }}
            >
                Pasta
            </Button>
            <Button

                fullWidth
                onClick={() => onFilterChange('Vegetable')}
                sx={{ textTransform: 'none' }}
            >
                Vegetable
            </Button>
            <Button

                fullWidth
                onClick={() => onFilterChange('Desserts')}
                sx={{ textTransform: 'none' }}
            >
                Desserts
            </Button>
            <Button

                fullWidth
                onClick={() => onFilterChange('Other')}
                sx={{ textTransform: 'none' }}
            >
                Other
            </Button>
        </Box>
    );
}