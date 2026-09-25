import type { Unit } from './measurements';

type ImportedUnit = Extract<
	Unit,
	'g' | 'kg' | 'ml' | 'l' | 'teaspoon' | 'tablespoon'
>;

type NormalisedIngredient =
	| { parsed: true; ingredient: string; quantity: number; unit: ImportedUnit }
	| { parsed: false; ingredient: string; quantity?: never; unit?: never };

const UNIT_ALIASES = new Map<string, ImportedUnit>([
	['tbsp', 'tablespoon'],
	['tablespoon', 'tablespoon'],
	['tablespoons', 'tablespoon'],
	['tsp', 'teaspoon'],
	['teaspoon', 'teaspoon'],
	['teaspoons', 'teaspoon'],
	['g', 'g'],
	['gram', 'g'],
	['grams', 'g'],
	['kg', 'kg'],
	['kilogram', 'kg'],
	['kilograms', 'kg'],
	['ml', 'ml'],
	['millilitre', 'ml'],
	['millilitres', 'ml'],
	['l', 'l'],
	['litre', 'l'],
	['litres', 'l'],
]);

export function normaliseScrapedIngredient(rawIngredient: string): NormalisedIngredient {
	const fallback: NormalisedIngredient = { parsed: false, ingredient: rawIngredient };
	// Match the entire prefix: never extract a number from a fraction or range.
	const match = rawIngredient.trim().match(/^(\d+(?:\.\d+)?)(\s*)([a-z]+)\s+(\p{L}[\s\S]*)$/iu);
	if (!match) return fallback;

	const [, rawQuantity, gap, rawUnit, ingredient] = match;
	const token = rawUnit.toLowerCase();
	const unit = UNIT_ALIASES.get(token);
	if (!unit) return fallback;

	// Only metric symbols may touch the number (e.g. 200g, not 2tbsp).
	if (!gap && !['g', 'kg', 'ml', 'l'].includes(token)) return fallback;
	// Do not split a composite measurement such as "200 g or 300 g flour".
	if (/^(?:x|or|to)\b/i.test(ingredient)) return fallback;

	const quantity = Number(rawQuantity);
	if (!Number.isFinite(quantity) || quantity <= 0 || quantity > Number.MAX_SAFE_INTEGER) {
		return fallback;
	}

	return { parsed: true, ingredient, quantity, unit };
}
