import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const useFilter = () => {
	const [selectedCategory, setSelectedCategory] = useState('');
	const router = useRouter();

	const handleFilterChange = (category) => {
		console.log('Category selected:', category);
		setSelectedCategory(category);
		router.push(`/recipes?category=${category}`); // Update the URL with the category
	};

	console.log('Currently selected category:', selectedCategory);

	return {
		selectedCategory,
		handleFilterChange,
	};
};
