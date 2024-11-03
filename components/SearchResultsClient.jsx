// components/SearchResultsClient.jsx
'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { searchRecipes } from '@/app/actions/searchRecipes';

const SearchResultsClient = ({ searchQuery, ingredients, category }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSearchResults() {
            try {
                const results = await searchRecipes({ searchQuery, ingredients, category });
                setSearchResults(results);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSearchResults();
    }, [searchQuery, ingredients, category]);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>Search Results</Typography>
            {loading ? (
                <CircularProgress />
            ) : searchResults.length > 0 ? (
                searchResults.map((recipe) => (
                    <RecipeOverviewCard key={recipe._id} recipe={recipe} />
                ))
            ) : (
                <Typography>No recipes found.</Typography>
            )}
        </Box>
    );
};

export default SearchResultsClient;