'use client';
import { createContext, useContext, useState } from 'react';

// Create a context for favorites
const FavouriteRecipesContext = createContext();

// Custom hook for easy access to favorites
export const useFavouriteRecipes = () => useContext(FavouriteRecipesContext);

export default function FavouriteRecipesProvider({ children }) {
	// Load favorites from local storage or database on mount
	const [favourites, setFavourites] = useState(() => {
		if (typeof window === 'undefined') {
			return [];
		}

		const saved = localStorage.getItem('favourites');

		return saved ? JSON.parse(saved) : [];
	});

	// Toggle favorite
	const toggleFavourite = useCallback((recipeId) => {
		setFavourites((prevFavourites) =>
			prevFavourites.includes(recipeId)
				? prevFavourites.filter((id) => id !== recipeId)
				: [...prevFavourites, recipeId],
		);
	}, []);

	const contextValue = useMemo(
		() => ({
			favourites,
			toggleFavourite,
		}),
		[favourites, toggleFavourite],
	);

	return (
		<FavouriteRecipesContext.Provider value={contextValue}>
			{children}
		</FavouriteRecipesContext.Provider>
	);
}
