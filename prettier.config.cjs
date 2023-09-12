module.exports = {
	$schema: 'http://json.schemastore.org/prettierrc',
	singleQuote: true,
	semi: true,
	printWidth: 120,
	trailingComma: 'all',
	arrowParens: 'avoid',
	bracketSpacing: false,
	useTabs: true,
	quoteProps: 'consistent',
	plugins: [require('prettier-plugin-tailwindcss')],
};
