// context/FilterContext.js
'use client';

import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export function useFilter() {
	return useContext(FilterContext);
}

export function FilterProvider({ children }) {
	const [selectedCategory, setSelectedCategory] = useState('All');

	const onFilterChange = (category) => {
		console.log('Category changed to:', category);
		setSelectedCategory(category);
	};

	return (
		<FilterContext.Provider value={{ selectedCategory, onFilterChange }}>
			{children}
		</FilterContext.Provider>
	);
}
