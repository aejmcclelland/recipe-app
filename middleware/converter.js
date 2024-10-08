// utils/unitConverter.js

const conversionRates = {
	gramsToOunces: 0.03527396,
	mlToOunces: 0.033814,
	kgToPounds: 2.20462,
	litersToGallons: 0.264172,
	// Add other necessary conversions as needed
};

export const convertToMetric = (quantity, unit) => {
	switch (unit) {
		case 'ounces':
			return {
				quantity: (quantity / conversionRates.gramsToOunces).toFixed(2),
				unit: 'grams',
			};
		case 'pounds':
			return {
				quantity: (quantity / conversionRates.kgToPounds).toFixed(2),
				unit: 'kg',
			};
		case 'gallons':
			return {
				quantity: (quantity / conversionRates.litersToGallons).toFixed(2),
				unit: 'liters',
			};
		default:
			return { quantity, unit }; // Return as-is if already metric or unsupported unit
	}
};

export const convertToImperial = (quantity, unit) => {
	switch (unit) {
		case 'grams':
			return {
				quantity: (quantity * conversionRates.gramsToOunces).toFixed(2),
				unit: 'ounces',
			};
		case 'kg':
			return {
				quantity: (quantity * conversionRates.kgToPounds).toFixed(2),
				unit: 'pounds',
			};
		case 'liters':
			return {
				quantity: (quantity * conversionRates.litersToGallons).toFixed(2),
				unit: 'gallons',
			};
		default:
			return { quantity, unit }; // Return as-is if already imperial or unsupported unit
	}
};
