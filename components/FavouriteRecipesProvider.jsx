'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Create a context for favorites
const FavouriteRecipesContext = createContext();

// Custom hook for easy access to favorites
export const useFavouriteRecipes = () => useContext(FavouriteRecipesContext);

export default function FavouriteRecipesProvider({ children }) {
    const [favourites, setFavourites] = useState([]);

    // Load favorites from local storage or database on mount
    useEffect(() => {
        const savedFavourites = JSON.parse(localStorage.getItem('favourites')) || [];
        setFavourites(savedFavourites);
    }, []);

    // Save to local storage or send to database on change
    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favourites));
    }, [favourites]);

    // Toggle favorite
    const toggleFavourite = (recipeId) => {
        setFavourites((prevFavourites) =>
            prevFavourites.includes(recipeId)
                ? prevFavourites.filter((id) => id !== recipeId)
                : [...prevFavourites, recipeId]
        );
    };


    // Check if a recipe is favorited
    const isFavourite = (recipeId) => favourites.includes(recipeId);

    return (
        <FavouriteRecipesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
            {children}
        </FavouriteRecipesContext.Provider>
    );
}

