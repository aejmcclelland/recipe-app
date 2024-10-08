'use client';
import { Button, Box } from '@mui/material';

export default function CategoryFilter({ onFilterChange }) {

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
                onClick={() => { console.log('Beef category clicked'); onFilterChange('Beef') }}
                sx={{ textTransform: 'none' }} // Optional: Remove button text capitalization
            >
                Beef
            </Button>
            <Button

                fullWidth
                onClick={() => { console.log('Chicken category clicked'); onFilterChange('Chicken') }}
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
                onClick={() => onFilterChange('Other')}
                sx={{ textTransform: 'none' }}
            >
                Other
            </Button>
        </Box>
    );
}