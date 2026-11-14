// utils/pluraliseUnit.ts
const IRREGULAR_PLURALS = new Map([
	['box', 'boxes'],
	['bunch', 'bunches'],
	['leaf', 'leaves'],
	['loaf', 'loaves'],
	['pinch', 'pinches'],
]);

export function pluraliseUnit(unit?: string, quantity?: number | string) {
	const qty = Number(quantity);
	if (!unit || !Number.isFinite(qty) || (qty > 0 && qty <= 1)) return unit;
	if (['g', 'kg', 'ml', 'l'].includes(unit)) return unit;

	if (unit.endsWith('s')) return unit;
	return IRREGULAR_PLURALS.get(unit) ?? `${unit}s`;
}
