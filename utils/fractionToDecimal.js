export function fractionToDecimal(fraction) {
	const parts = fraction.split('/');
	if (parts.length === 1) {
		// Handle whole numbers
		return parseFloat(parts[0]);
	}
	// Handle fractions
	const [numerator, denominator] = parts;
	return parseFloat(numerator) / parseFloat(denominator);
}
