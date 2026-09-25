import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliseScrapedIngredient } from '../../utils/normaliseScrapedIngredient';
import { pluraliseUnit } from '../../utils/pluraliseUnit';

const parsedCases = [
	['4 tbsp olive oil', 4, 'tablespoon', 'olive oil', 'tablespoons'],
	['2 tsp chilli flakes', 2, 'teaspoon', 'chilli flakes', 'teaspoons'],
	['200g plain flour', 200, 'g', 'plain flour', 'g'],
	['400 ml chicken stock', 400, 'ml', 'chicken stock', 'ml'],
	['  1.5   L Vegetable  Stock  ', 1.5, 'l', 'Vegetable  Stock', 'l'],
] as const;

for (const [raw, quantity, unit, ingredient, displayUnit] of parsedCases) {
	test(`recognises ${JSON.stringify(raw)}`, () => {
		assert.deepEqual(normaliseScrapedIngredient(raw), { parsed: true, ingredient, quantity, unit });
		assert.equal(pluraliseUnit(unit, quantity), displayUnit);
	});
}

for (const raw of [
	'2 garlic cloves',
	'½ tsp chilli flakes',
	'2 x 400g tins tomatoes',
	'  Salt and  pepper to taste  ',
	'1-2 tbsp olive oil',
	'1..5 g flour',
	'',
]) {
	test(`preserves ${JSON.stringify(raw)}`, () => {
		assert.deepEqual(normaliseScrapedIngredient(raw), { parsed: false, ingredient: raw });
	});
}
