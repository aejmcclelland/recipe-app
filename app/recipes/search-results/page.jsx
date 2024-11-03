// app/recipes/search-results/page.jsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';
import { searchRecipes } from '@/app/actions/searchRecipes';

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('searchQuery') || '';
    const ingredients = searchParams.get('ingredients') || '';
    const category = searchParams.get('category') || '';

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSearchResults() {
            const results = await searchRecipes({ searchQuery, ingredients, category });
            setSearchResults(results);
            setLoading(false);
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
}