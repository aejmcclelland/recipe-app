// utils/measurements.ts

export const UNIT_OPTIONS = [
	// Weight
	{ value: 'g', label: 'g' },
	{ value: 'kg', label: 'kg' },
	{ value: 'ounce', label: 'ounce' },
	{ value: 'pound', label: 'pound' },

	// Volume
	{ value: 'ml', label: 'ml' },
	{ value: 'l', label: 'l' },
	{ value: 'teaspoon', label: 'teaspoon' },
	{ value: 'tablespoon', label: 'tablespoon' },
	{ value: 'cup', label: 'cup' },
	{ value: 'pint', label: 'pint' },
	{ value: 'quart', label: 'quart' },
	{ value: 'gallon', label: 'gallon' },

	// Count / food-specific
	{ value: 'clove', label: 'clove' },
	{ value: 'fillet', label: 'fillet' },
	{ value: 'pinch', label: 'pinch' },
	{ value: 'slice', label: 'slice' },
	{ value: 'piece', label: 'piece' },
	{ value: 'stick', label: 'stick' },
	{ value: 'head', label: 'head' },
	{ value: 'leaf', label: 'leaf' },
	{ value: 'sprig', label: 'sprig' },
	{ value: 'loaf', label: 'loaf' },
	{ value: 'bunch', label: 'bunch' },

	// Containers
	{ value: 'bottle', label: 'bottle' },
	{ value: 'can', label: 'can' },
	{ value: 'bag', label: 'bag' },
	{ value: 'package', label: 'package' },
	{ value: 'container', label: 'container' },
	{ value: 'bowl', label: 'bowl' },
	{ value: 'pot', label: 'pot' },
	{ value: 'jar', label: 'jar' },
	{ value: 'box', label: 'box' },
	{ value: 'roll', label: 'roll' },
	{ value: 'sheet', label: 'sheet' },
] as const;

export type Unit = (typeof UNIT_OPTIONS)[number]['value'];