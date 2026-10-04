let selectedCategory = 'All';

export function setSelectedCategory(value: string) {
	selectedCategory = value;
}

export function useFilter() {
	return { selectedCategory };
}
