import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig([
	globalIgnores(['.next/**', 'out/**', 'public/**', 'next-env.d.ts']),
	nextCoreWebVitals,
	nextTypescript,
	{
		rules: {
			'react/no-unescaped-entities': 'off',
			'@next/next/no-img-element': 'off',
			'@typescript-eslint/no-namespace': 'off',
		},
	},
	{
		files: ['*.config.js'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
]);
