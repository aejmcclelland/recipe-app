// components/HomeClient.jsx
'use client';

import { useFilter } from '@/context/FilterContext';
import { useMemo } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';

export default function HomeClient({ recipes = [], user }) {
	const { selectedCategory } = useFilter();

	// Avoid effects + state here. Compute derived lists deterministically.
	// This prevents extra re-renders when `user` is a new object each render.
	const bookmarkedIds = useMemo(() => {
		const ids = user?.bookmarks ?? [];
		// Ensure strings for reliable comparison
		return new Set(ids.map((id) => String(id)));
	}, [user?.bookmarks]);

	const updatedRecipes = useMemo(() => {
		return (recipes ?? []).map((recipe) => {
			const id = String(recipe?._id ?? '');
			return {
				...recipe,
				_id: id,
				isBookmarked: id ? bookmarkedIds.has(id) : false,
			};
		});
	}, [recipes, bookmarkedIds]);

	const filteredRecipes = useMemo(() => {
		if (!selectedCategory || selectedCategory === 'All') return updatedRecipes;
		return updatedRecipes.filter(
			(recipe) => recipe?.category?.name === selectedCategory
		);
	}, [selectedCategory, updatedRecipes]);

	return (
		<Container maxWidth="lg">
			<Grid container spacing={4} justifyContent="center">
				{filteredRecipes.length > 0 ? (
					filteredRecipes.map((recipe) => (
						<Grid xs={12} sm={6} md={4} key={recipe._id}>
							<RecipeOverviewCard
								recipe={recipe}
								user={user}
								isBookmarked={recipe.isBookmarked}
							/>
						</Grid>
					))
				) : (
					<Box textAlign="center" mt={4}>
						<Typography>No recipes found for this category.</Typography>
					</Box>
				)}
			</Grid>
		</Container>
	);
}