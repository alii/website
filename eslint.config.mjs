import reactHooks from 'eslint-plugin-react-hooks';
import {defineConfig, globalIgnores} from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['build/**', 'tmp/**', 'public/**']),
	tseslint.configs.recommended,
	reactHooks.configs.flat.recommended,
	{
		rules: {
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
