/* eslint-disable unicorn/prefer-module */

const colors = require('tailwindcss/colors');
const defaults = require('tailwindcss/defaultTheme');

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
	purge: ['./src/**/*.{tsx,ts}'],
	darkMode: 'class',
	mode: 'jit',
	theme: {
		colors: {
			...colors,
			transparent: 'transparent',
		},
		extend: {
			fontFamily: {
				...defaults.fontFamily,
				sans: ['Roboto', ...defaults.fontFamily.sans],
			},
		},
	},
	variants: {
		typography: ['dark'],
		animation: ['motion-safe'],
	},
	plugins: [require('@tailwindcss/typography')],
};
