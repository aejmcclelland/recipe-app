import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAndCleanRecipeForm } from '../../utils/recipeFormValidation';
import { fractionToDecimal } from '../../utils/fractionToDecimal.js';

test('edit normalization retains populated names, fractions, custom units and step trimming', () => {
	const result = validateAndCleanRecipeForm({
		ingredients: [{ ingredient: { name: ' olive oil ' }, quantity: '1/2', unit: 'other', customUnit: ' ladle ' }, { ingredient: ' garlic cloves ', quantity: 2 }, { ingredient: '', quantity: '', unit: '' }],
		steps: ['  Cook gently.  ', '', ' Serve. '], fractionToDecimal,
	});
	assert.equal(result.ok, true);
	if (!result.ok) return;
	assert.deepEqual(result.cleanedSteps, ['Cook gently.', 'Serve.']);
	assert.equal(result.cleanedIngredients.length, 2);
	assert.equal(result.cleanedIngredients[0].ingredient, 'olive oil');
	assert.equal(result.cleanedIngredients[0].quantity, 0.5);
	assert.equal(result.cleanedIngredients[0].unit, 'ladle');
	assert.equal(result.cleanedIngredients[1].quantity, 2);
});
for (const [ingredients, steps, message] of [
	[[], ['Cook.'], 'Please add at least one ingredient.'],
	[[{ ingredient: 'onion' }], [' '], 'Please add at least one step.'],
	[[{ ingredient: '', quantity: 2 }], ['Cook.'], 'Please fix the highlighted ingredient fields.'],
	[[{ ingredient: 'oil', unit: 'g' }], ['Cook.'], 'Please fix the highlighted ingredient fields.'],
	[[{ ingredient: 'oil', quantity: 2, unit: 'other', customUnit: '' }], ['Cook.'], 'Please fix the highlighted ingredient fields.'],
] as const) {
	test(`edit validation retains failure: ${JSON.stringify(ingredients)}`, () => {
		const result = validateAndCleanRecipeForm({ ingredients: [...ingredients], steps: [...steps], fractionToDecimal });
		assert.equal(result.ok, false);
		if (result.ok) return;
		assert.equal(result.message, message);
	});
}
