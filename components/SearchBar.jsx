// components/SearchBar.jsx
'use client';
import { useState } from 'react';
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
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                px: 2,
                py: 0.5,
                gap: 1,
                maxWidth: 560,
                width: '100%',
                mb: 2,
                '&:focus-within': { borderColor: 'text.primary' },
            }}
        >
            <InputBase
                placeholder="Search for recipes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
                sx={{ flex: 1, minWidth: 0 }}
            />
            <IconButton type="submit" aria-label="Search recipes">
                <SearchIcon />
            </IconButton>
        </Box>
    );
};

export default SearchBar;
