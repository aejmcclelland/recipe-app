const COOKING_FRACTIONS = [
	[1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'],
	[3 / 8, '⅜'], [1 / 2, '½'], [5 / 8, '⅝'],
	[2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'],
] as const;

const FRACTION_TOLERANCE = 0.000001;

// Presentation only: keep the original numeric quantity for storage and logic.
export function formatQuantity(quantity: number | string): string {
	const value = Number(quantity);
	if (!Number.isFinite(value) || value <= 0) return String(quantity);

	const whole = Math.floor(value);
	const fraction = value - whole;
	const match = COOKING_FRACTIONS.find(
		([amount]) => Math.abs(fraction - amount) <= FRACTION_TOLERANCE,
	);
	if (!match) return String(value);

	return `${whole || ''}${match[1]}`;
}
