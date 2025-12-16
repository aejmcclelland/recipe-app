// components/SearchBar.jsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        const query = `?searchQuery=${searchQuery}`;
        router.push(`/recipes/search-results${query}`);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffffff',
                borderRadius: 2,
                padding: '4px 8px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px',
                margin: '20px auto',
            }}
        >
            <InputBase
                placeholder="Search for recipes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
                sx={{ ml: 1, flex: 1, color: '#000000' }}
            />
            <IconButton type="submit" sx={{ color: '#555555' }}>
                <SearchIcon />
            </IconButton>
        </Box>
    );
};

export default SearchBar;