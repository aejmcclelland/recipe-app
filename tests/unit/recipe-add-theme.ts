import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usesRecipeAddTheme, usesRecipeEditTheme } from '../../theme/publicRoutes';

test('Add theme is restricted to the authenticated exact Add route', () => {
	assert.equal(usesRecipeAddTheme('/recipes/add', true), true);
	assert.equal(usesRecipeAddTheme('/recipes/add', false), false);
	for (const route of [null, '/', '/recipes', '/recipes/add/other', '/recipes/search-results', '/recipes/copyWeb', '/recipes/profile', '/recipes/cccccccccccccccccccccccc', '/recipes/cccccccccccccccccccccccc/edit']) {
		assert.equal(usesRecipeAddTheme(route, true), false, String(route));
	}
	assert.equal(usesRecipeEditTheme('/recipes/cccccccccccccccccccccccc/edit', true), true);
	assert.equal(usesRecipeEditTheme('/recipes/add', true), false);
});
