module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: ['next', 'next/core-web-vitals', 'plugin:react/recommended', 'xo', 'xo-typescript', 'xo-react'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {jsx: true},
		ecmaVersion: 12,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['react', '@typescript-eslint'],
	ignorePatterns: ['**/*.js'],
	rules: {
		'@typescript-eslint/triple-slash-reference': 'off',
		'react/function-component-definition': 'off',
		'react/jsx-tag-spacing': 'off',
		'@typescript-eslint/comma-dangle': 'off',
		'react/no-unescaped-entities': 'off',
		'no-mixed-operators': 'off',
	},
};
