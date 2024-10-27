// context/FilterContext.js
'use client';

import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export function useFilter() {
	return useContext(FilterContext);
}

export function FilterProvider({ children }) {
	const [selectedCategory, setSelectedCategory] = useState('All'); // Default to "All"

	const onFilterChange = (category) => {
		setSelectedCategory(category);
	};

	return (
		<FilterContext.Provider value={{ selectedCategory, onFilterChange }}>
			{children}
		</FilterContext.Provider>
	);
}
