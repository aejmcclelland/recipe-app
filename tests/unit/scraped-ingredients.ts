import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliseScrapedIngredient } from '../../utils/normaliseScrapedIngredient';
import { pluraliseUnit } from '../../utils/pluraliseUnit';
import { validateAndCleanRecipeForm } from '../../utils/recipeFormValidation';

const parsedCases = [
	['4 tbsp olive oil', 4, 'tablespoon', 'olive oil', 'tablespoons'],
	['2 tsp chilli flakes', 2, 'teaspoon', 'chilli flakes', 'teaspoons'],
	['200g plain flour', 200, 'g', 'plain flour', 'g'],
	['400 ml chicken stock', 400, 'ml', 'chicken stock', 'ml'],
	['  1.5   L Vegetable  Stock  ', 1.5, 'l', 'Vegetable  Stock', 'l'],
	['¼ tsp chilli flakes', 0.25, 'teaspoon', 'chilli flakes', 'teaspoon'],
	['½ tsp salt', 0.5, 'teaspoon', 'salt', 'teaspoon'],
	['1½ tbsp sugar', 1.5, 'tablespoon', 'sugar', 'tablespoons'],
	['1/2 tsp salt', 0.5, 'teaspoon', 'salt', 'teaspoon'],
	['1 1/2 tbsp sugar', 1.5, 'tablespoon', 'sugar', 'tablespoons'],
	['½kg potatoes', 0.5, 'kg', 'potatoes', 'kg'],
] as const;

for (const [raw, quantity, unit, ingredient, displayUnit] of parsedCases) {
	test(`recognises ${JSON.stringify(raw)}`, () => {
		assert.deepEqual(normaliseScrapedIngredient(raw), { parsed: true, ingredient, quantity, unit });
		assert.equal(pluraliseUnit(unit, quantity), displayUnit);
	});
}

for (const raw of [
	'2 x 400g cans chopped tomatoes',
	'  Salt and  pepper to taste  ',
	'1-2 tbsp olive oil',
	'1–2 tbsp olive oil',
	'½-1 tsp chilli flakes',
	'1/2-1 tsp chilli flakes',
	'1/0 tsp salt',
	'1..5 g flour',
	'',
]) {
	test(`preserves ${JSON.stringify(raw)}`, () => {
		assert.deepEqual(normaliseScrapedIngredient(raw), { parsed: false, ingredient: raw });
	});
}

for (const [raw, quantity, ingredient] of [
	['1 onion finely chopped', 1, 'onion finely chopped'],
	['2 garlic cloves crushed', 2, 'garlic cloves crushed'],
	['4 skinless chicken breasts, sliced into strips', 4, 'skinless chicken breasts, sliced into strips'],
	['½ avocado', 0.5, 'avocado'],
] as const) {
	test(`recognises count ${JSON.stringify(raw)}`, () => {
		assert.deepEqual(normaliseScrapedIngredient(raw), { parsed: true, ingredient, quantity });
	});
}

test('quantity without unit is valid for manual and populated edit rows', () => {
	for (const ingredient of ['eggs', { name: 'garlic cloves crushed' }]) {
		const result = validateAndCleanRecipeForm({ ingredients: [{ ingredient, quantity: '2', unit: '' }], steps: ['Mix.'] });
		assert.equal(result.ok, true);
	}
});

test('unit without quantity remains invalid', () => {
	const result = validateAndCleanRecipeForm({ ingredients: [{ ingredient: 'olive oil', unit: 'tablespoon' }], steps: ['Mix.'] });
	assert.equal(result.ok, false);
	assert.ok(result.ingredientErrors?.[0].quantity);
});
