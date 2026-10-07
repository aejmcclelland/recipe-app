import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ReactElement } from 'react';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as routeRules from '../../theme/publicRoutes';

// Exercise the actual component's theme selection with controlled session/path
// inputs. Next.js accepts JSX in .js; transpile that source for this Node test.
const require = createRequire(import.meta.url);
const { transformSync } = require(require.resolve('esbuild', { paths: [require.resolve('tsx')] })) as {
    transformSync(source: string, options: { loader: 'jsx'; jsx: 'automatic'; format: 'cjs' }): { code: string };
};
const legacyTheme = { name: 'legacy' };
const publicTheme = { name: 'public' };
const homeTheme = { name: 'home' };
const profileTheme = { name: 'profile' };
let pathname: string | null = '/';
let session: { user: { id: string } } | null = null;
const imports: Record<string, unknown> = {
    '../theme/theme': legacyTheme,
    '@/theme/publicTheme': publicTheme,
    '@/theme/homeTheme': homeTheme,
    '@/theme/profileTheme': profileTheme,
    '@/theme/publicRoutes': routeRules,
    '@mui/material-nextjs/v13-appRouter': { AppRouterCacheProvider: 'CacheProvider' },
    '@mui/material': { ThemeProvider: 'ThemeProvider', CssBaseline: 'CssBaseline' },
    'next/navigation': { usePathname: () => pathname },
    'next-auth/react': { useSession: () => ({ data: session, status: session ? 'authenticated' : 'unauthenticated' }) },
};
type RegistryElement = ReactElement<{ children: ReactElement<{ theme: unknown }> }>;
const compiledModule = { exports: {} as { default: (props: { children: string }) => RegistryElement } };
const source = readFileSync(new URL('../../app/ThemeRegistry.js', import.meta.url), 'utf8');
const { code } = transformSync(source, { loader: 'jsx', jsx: 'automatic', format: 'cjs' });
runInNewContext(code, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: (specifier: string) => imports[specifier] ?? require(specifier),
});
const ThemeRegistry = compiledModule.exports.default;
function selectedTheme() {
    const tree = ThemeRegistry({ children: 'Route content' });
    const provider = tree.props.children;
    assert.equal(provider.type, 'ThemeProvider');
    return provider.props.theme;
}
for (const [route, authenticatedTheme] of [
	['/recipes/profile', profileTheme],
	['/recipes/copyWeb', profileTheme],
	['/recipes/add', profileTheme],
	['/recipes/cccccccccccccccccccccccc/edit', profileTheme],
	['/recipes/ABCDEFABCDEFABCDEFABCDEF/edit', profileTheme],
	['/recipes/cccccccccccccccccccccccc', publicTheme],
	['/recipes/ABCDEFABCDEFABCDEFABCDEF', publicTheme],
] as const) {
	test(`session clears before pathname changes: ${route}`, () => {
		pathname = route; session = { user: { id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } };
		assert.equal(selectedTheme(), authenticatedTheme);
		session = null; // signOut refreshes SessionProvider before router.push completes.
		assert.equal(pathname, route);
		assert.equal(selectedTheme(), publicTheme);
		assert.equal(selectedTheme(), publicTheme); // Safe throughout delayed navigation.
		pathname = '/recipes/signin';
		assert.equal(selectedTheme(), publicTheme);
	});
}
test('home moves directly from its authenticated theme to public', () => {
	pathname = '/'; session = { user: { id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } };
	assert.equal(selectedTheme(), homeTheme);
	session = null;
	assert.equal(selectedTheme(), publicTheme);
});
test('explicit public routes retain the public theme with or without a session', () => {
	for (const route of ['/recipes/signin', '/recipes/register', '/recipes/forgot-password', '/privacy-policy', '/terms-of-service']) {
		pathname = route; session = { user: { id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } };
		assert.equal(selectedTheme(), publicTheme);
		session = null;
		assert.equal(selectedTheme(), publicTheme);
	}
});
test('unmigrated and nonmatching routes retain the legacy fallback', () => {
	for (const route of [null, '/recipes', '/recipes/search-results', '/recipes/profile/edit', '/recipes/add/other', '/recipes/copyWeb/edit', '/recipes/invalid/edit', '/recipes/cccccccccccccccccccccccc/edit/other']) {
		pathname = route; session = { user: { id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } };
		assert.equal(selectedTheme(), legacyTheme);
		session = null;
		assert.equal(selectedTheme(), legacyTheme);
	}
});
