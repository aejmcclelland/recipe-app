// components/SearchBar.jsx
import React from 'react';
import { Box, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f5f5f5', // Light grey background
                borderRadius: 2,
                padding: '4px 8px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Light shadow around the search bar
                maxWidth: '400px', // Adjust based on design
                margin: '20px auto', // Center it horizontally
            }}
        >
            <IconButton sx={{ color: '#555555' }}> {/* Dark grey search icon */}
                <SearchIcon />
            </IconButton>
            <InputBase
                placeholder="Search for recipes…"
                inputProps={{ 'aria-label': 'search' }}
                sx={{ ml: 1, flex: 1, color: '#000000' }} // Set text color to ensure it's visible
            />
        </Box>
    );
};

export default SearchBar;