// @ts-check

const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./{src,app}/**/*.{ts,tsx}'],
	theme: {
		fontFamily: {},
	},
	plugins: [],
};
