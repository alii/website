// @ts-check

const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./{src,app}/**/*.{ts,tsx}'],
	theme: {
		fontFamily: {
			sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
			title: ['var(--font-title)', ...defaultTheme.fontFamily.serif],
		},
		extend: {
			colors: {
				blurple: '#5865F2',
			},
		},
	},
	plugins: [],
};
