import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usesImportTheme } from '../../theme/publicRoutes';

test('import theme is limited to the exact authenticated import route', () => {
	assert.equal(usesImportTheme('/recipes/copyWeb', true), true);
	assert.equal(usesImportTheme('/recipes/copyWeb', false), false);
	for (const route of [null, '/', '/recipes', '/recipes/search-results', '/recipes/add', '/recipes/copyWeb/edit', '/recipes/profile', '/recipes/signin', '/recipes/cccccccccccccccccccccccc']) {
		assert.equal(usesImportTheme(route, true), false, String(route));
	}
});
