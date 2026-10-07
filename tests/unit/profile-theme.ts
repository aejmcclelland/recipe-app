import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usesProfileTheme } from '../../theme/publicRoutes';

test('profile theme is restricted to the exact authenticated profile route', () => {
	assert.equal(usesProfileTheme('/recipes/profile', true), true);
	assert.equal(usesProfileTheme('/recipes/profile', false), false);
	for (const route of [null, '/', '/recipes', '/recipes/profile/edit', '/recipes/add', '/recipes/copyWeb', '/recipes/signin', '/recipes/cccccccccccccccccccccccc', '/recipes/cccccccccccccccccccccccc/edit']) {
		assert.equal(usesProfileTheme(route, true), false, String(route));
	}
});
