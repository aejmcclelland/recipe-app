// utils/pluraliseUnit.ts
export function pluraliseUnit(unit?: string, quantity?: number | string) {
	const qty = Number(quantity);
	if (!unit || !Number.isFinite(qty) || (qty > 0 && qty <= 1)) return unit;
	if (['g', 'kg', 'ml', 'l'].includes(unit)) return unit;

	if (unit.endsWith('s')) return unit;
	return `${unit}s`;
}
