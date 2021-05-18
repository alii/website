// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors');

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
	purge: ['./src/**/*.{tsx,ts}'],
	darkMode: 'class',
	mode: 'jit',
	theme: {colors},
	variants: {
		typography: ['dark'],
	},
	plugins: [require('@tailwindcss/typography')],
};
