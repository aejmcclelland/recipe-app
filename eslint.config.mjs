import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	...nextVitals,
	...nextTs,

	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],

			'react-hooks/error-boundaries': 'warn',
			'react-hooks/set-state-in-effect': 'warn',

			'prefer-const': 'warn',
		},
	},

	globalIgnores([
		'.next/**',
		'node_modules/**',
		'out/**',
		'build/**',
		'coverage/**',
		'playwright-report/**',
		'test-results/**',
		'next-env.d.ts',
	]),
]);
