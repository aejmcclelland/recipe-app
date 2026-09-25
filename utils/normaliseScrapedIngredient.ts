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

const UNICODE_FRACTIONS = new Map<string, number>([
	['½', 1 / 2], ['⅓', 1 / 3], ['⅔', 2 / 3],
	['¼', 1 / 4], ['¾', 3 / 4],
	['⅛', 1 / 8], ['⅜', 3 / 8], ['⅝', 5 / 8], ['⅞', 7 / 8],
]);

// Recognise a whole quantity token before the existing unit/count description.
const quantityPatterns = [
	String.raw`(?:\d+\s*)?[${[...UNICODE_FRACTIONS.keys()].join('')}]`,
	String.raw`(?:\d+\s+)?\d+/\d+`,
	String.raw`\d+(?:\.\d+)?`,
];
const LEADING_QUANTITY = new RegExp(
	`^(${quantityPatterns.join('|')})(\\s*)(\\p{L}[\\s\\S]*)$`,
	'iu',
);

// Called only with complete tokens recognised above, never with partial text.
function quantityToNumber(token: string): number {
	const unicodeFraction = UNICODE_FRACTIONS.get(token.slice(-1));
	if (unicodeFraction !== undefined) {
		const whole = Number(token.slice(0, -1).trim() || '0');
		return Number.isSafeInteger(whole) ? whole + unicodeFraction : NaN;
	}
	if (token.includes('/')) {
		const parts = token.split(/\s+/);
		const [numerator, denominator] = parts.pop().split('/').map(Number);
		const whole = Number(parts[0] ?? '0');
		if (![whole, numerator, denominator].every(Number.isSafeInteger) || numerator <= 0 || denominator <= 0) {
			return NaN;
		}
		return whole + numerator / denominator;
	}
	return Number(token);
}

export function normaliseScrapedIngredient(rawIngredient: string): NormalisedIngredient {
	const fallback: NormalisedIngredient = { parsed: false, ingredient: rawIngredient };
	// Ranges and malformed fractions cannot match the complete leading quantity.
	const match = rawIngredient.trim().match(LEADING_QUANTITY);
	if (!match) return fallback;

	const [, rawQuantity, gap, description] = match;
	const quantity = quantityToNumber(rawQuantity);
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
