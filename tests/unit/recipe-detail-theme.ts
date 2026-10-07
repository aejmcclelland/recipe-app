import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usesHomeTheme, usesPublicTheme, usesRecipeDetailTheme } from '../../theme/publicRoutes';

test('detail theme requires an authenticated session and an exact recipe ID route', () => {
	assert.equal(usesRecipeDetailTheme('/recipes/abcdef0123456789ABCDEF01', true), true);
	assert.equal(usesRecipeDetailTheme('/recipes/abcdef0123456789ABCDEF01', false), false);
	for (const route of [null, '/', '/recipes', '/recipes/search-results', '/recipes/add', '/recipes/copyWeb', '/recipes/profile', '/recipes/signin', '/recipes/invalid', '/recipes/abcdef0123456789abcdef01/edit']) {
		assert.equal(usesRecipeDetailTheme(route, true), false, String(route));
	}
});

test('home and public theme selection is unchanged', () => {
	assert.equal(usesHomeTheme('/', true), true);
	assert.equal(usesHomeTheme('/', false), false);
	assert.equal(usesPublicTheme('/', false), true);
	assert.equal(usesPublicTheme('/', true), false);
	assert.equal(usesPublicTheme('/recipes/register', true), true);
	assert.equal(usesPublicTheme('/recipes/abcdef0123456789abcdef01', true), false);
});
