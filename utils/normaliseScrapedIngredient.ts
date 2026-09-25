import type { Unit } from './measurements';

type ImportedUnit = Extract<
	Unit,
	'g' | 'kg' | 'ml' | 'l' | 'teaspoon' | 'tablespoon'
>;

type NormalisedIngredient =
	| { parsed: true; ingredient: string; quantity: number; unit?: ImportedUnit }
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
	const match = rawIngredient.trim().match(/^(\d+(?:\.\d+)?)(\s*)(\p{L}[\s\S]*)$/iu);
	if (!match) return fallback;

	const [, rawQuantity, gap, description] = match;
	const quantity = Number(rawQuantity);
	if (!Number.isFinite(quantity) || quantity <= 0 || quantity > Number.MAX_SAFE_INTEGER) {
		return fallback;
	}

	const token = description.match(/^[a-z]+/i)?.[0].toLowerCase();
	const unit = UNIT_ALIASES.get(token);
	const compositePrefix = /^(?:x|or|to)\b|^x\d/i;
	if (unit) {
		const measurement = description.match(/^[a-z]+\s+(\p{L}[\s\S]*)$/iu);
		if (!measurement || compositePrefix.test(measurement[1])) return fallback;
		// Only metric symbols may touch the number (e.g. 200g, not 2tbsp).
		if (!gap && !['g', 'kg', 'ml', 'l'].includes(token)) return fallback;
		return { parsed: true, ingredient: measurement[1], quantity, unit };
	}

	// Count ingredients keep all nouns/descriptors; never consume "2 x 400g ...".
	if (!gap || compositePrefix.test(description)) return fallback;
	return { parsed: true, ingredient: description, quantity };
}
