// components/HomeClient.jsx
'use client';

import { useFilter } from '@/context/FilterContext';
import { useMemo } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import RecipeOverviewCard from '@/components/RecipeOverviewCard';

export default function HomeClient({ recipes = [], sharedRecipes = [], user }) {
	const { selectedCategory } = useFilter();

	const bookmarkedIds = useMemo(() => {
		const ids = user?.bookmarks ?? [];
		return new Set(ids.map((id) => String(id)));
	}, [user?.bookmarks]);

	const preparedRecipes = useMemo(() => {
		const prepare = (items) => (items ?? []).map((recipe) => {
			const id = String(recipe?._id ?? '');
			return {
				...recipe,
				_id: id,
				isBookmarked: id ? bookmarkedIds.has(id) : false,
			};
		});
		return { owned: prepare(recipes), shared: prepare(sharedRecipes) };
	}, [recipes, sharedRecipes, bookmarkedIds]);

	const matchesCategory = (recipe) =>
		!selectedCategory || selectedCategory === 'All' ||
		recipe?.category?.name === selectedCategory;
	const owned = preparedRecipes.owned.filter(matchesCategory);
	const shared = preparedRecipes.shared.filter(matchesCategory);

	function recipeGrid(items, emptyMessage) {
		return (
			<Grid container spacing={4} justifyContent="center">
				{items.length > 0 ? items.map((recipe) => (
					<Grid size={{ xs: 12, sm: 6, md: 4 }} key={recipe._id}>
						<RecipeOverviewCard
							appearance="home"
							recipe={recipe}
							user={user}
							isBookmarked={recipe.isBookmarked}
						/>
					</Grid>
				)) : (
					<Box textAlign="center" sx={{ py: 4, px: 2, color: 'text.secondary', width: '100%' }}>
						<Typography>{emptyMessage}</Typography>
					</Box>
				)}
			</Grid>
		);
	}

	return (
		<Container maxWidth="lg" disableGutters>
			{sharedRecipes.length === 0 ? (
				recipeGrid(owned, 'No recipes found for this category.')
			) : (
				<>
					<Box component="section" aria-label="My Recipes" sx={{ mb: 6 }}>
						<Typography component="h2" variant="h4" sx={{ mb: 3 }}>
							My Recipes
						</Typography>
						{recipeGrid(owned, recipes.length === 0
							? 'You have not added any recipes of your own yet.'
							: 'No recipes found for this category.')}
					</Box>
					<Box component="section" aria-label="Shared with me" sx={{ mb: 6 }}>
						<Typography component="h2" variant="h4" sx={{ mb: 3 }}>
							Shared with me
						</Typography>
						{recipeGrid(shared, 'No shared recipes found for this category.')}
					</Box>
				</>
			)}
		</Container>
	);
}
