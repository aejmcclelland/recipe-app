import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usesRecipeEditTheme } from '../../theme/publicRoutes';

test('edit theme requires an authenticated session and an exact recipe edit route', () => {
	assert.equal(usesRecipeEditTheme('/recipes/cccccccccccccccccccccccc/edit', true), true);
	assert.equal(usesRecipeEditTheme('/recipes/ABCDEFABCDEFABCDEFABCDEF/edit', true), true);
	assert.equal(usesRecipeEditTheme('/recipes/cccccccccccccccccccccccc/edit', false), false);
	for (const route of [null, '/', '/recipes', '/recipes/search-results', '/recipes/add', '/recipes/copyWeb', '/recipes/profile', '/recipes/cccccccccccccccccccccccc', '/recipes/invalid/edit', '/recipes/cccccccccccccccccccccccc/edit/other']) {
		assert.equal(usesRecipeEditTheme(route, true), false, String(route));
	}
});
