// components/SearchResultsClient.jsx
'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
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
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Typography variant="h4" gutterBottom>Search Results</Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : searchResults.length > 0 ? (

                <Grid container spacing={2} justifyContent="center">
                    {searchResults.map((recipe) => (
                        <Grid
                            key={recipe._id}
                            xs={12}
                            sm={6}
                            md={4}
                            sx={{ display: 'flex' }}
                        >
                            <Box sx={{ width: 1 }}>
                                <RecipeOverviewCard recipe={recipe} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No recipes found.</Typography>
            )}
        </Container>
    );
};

export default SearchResultsClient;