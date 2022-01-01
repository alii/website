/* eslint-disable unicorn/prefer-module */

const defaults = require('tailwindcss/defaultTheme');

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
	content: ['./src/**/*.{tsx,ts,css}'],
	darkMode: 'media',
	theme: {
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
