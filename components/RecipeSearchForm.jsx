// components/RecipeSearchForm.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const RecipeSearchForm = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [category, setCategory] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        const query = `?searchQuery=${searchQuery}&ingredients=${ingredients}&category=${category}`;
        router.push(`/recipes/search-results${query}`);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
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
                sx={{ ml: 1, flex: 1, color: '#000000' }}
            />
            <InputBase
                placeholder="Ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                sx={{ ml: 1, flex: 1, color: '#000000' }}
            />
            <InputBase
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ ml: 1, flex: 1, color: '#000000' }}
            />
            <IconButton type="submit" sx={{ color: '#555555' }}>
                <SearchIcon />
            </IconButton>
        </Box>
    );
};

export default RecipeSearchForm;