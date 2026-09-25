import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatQuantity } from '../../utils/formatQuantity';
import { pluraliseUnit } from '../../utils/pluraliseUnit';

test('formats cooking fractions and mixed quantities', () => {
	assert.equal(formatQuantity(0.25), '¼');
	assert.equal(formatQuantity(1.5), '1½');
	assert.equal(formatQuantity(2.75), '2¾');
	assert.equal(formatQuantity('0.5'), '½');
});

test('tolerates small floating-point differences in thirds', () => {
	assert.equal(formatQuantity(0.333333), '⅓');
	assert.equal(formatQuantity(1 + 2 / 3), '1⅔');
});

test('preserves whole numbers and decimals outside the fraction tolerance', () => {
	assert.equal(formatQuantity(0), '0');
	assert.equal(formatQuantity(2), '2');
	assert.equal(formatQuantity(200), '200');
	assert.equal(formatQuantity(0.3), '0.3');
	assert.equal(formatQuantity(1.25001), '1.25001');
});

test('uses numeric quantities for unit pluralisation', () => {
	assert.equal(pluraliseUnit('teaspoon', 0.25), 'teaspoon');
	assert.equal(pluraliseUnit('tablespoon', 1.5), 'tablespoons');
	assert.equal(pluraliseUnit('g', 200), 'g');
});
