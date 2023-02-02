// @ts-check

const defaultTheme = require('tailwindcss/defaultTheme');
const {default: flattenColorPalette} = require('tailwindcss/lib/util/flattenColorPalette');

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
	plugins: [
		{
			handler: tw => {
				tw.addComponents({
					'.bg-grid': {
						backgroundSize: '30px 30px',
						backgroundImage: `
							linear-gradient(to right, #ffffff20 1px, transparent 1px),
    						linear-gradient(to bottom, #ffffff20 1px, transparent 1px)
						`,
					},
				});

				tw.matchUtilities(
					{
						'text-glow': value => ({
							'text-shadow': `0 0 10px ${value}, 0 0 150px ${value}`,
						}),
						'glow': value => ({
							filter: `drop-shadow(0px 0px 7px ${value})`,
						}),
					},
					{
						values: flattenColorPalette(tw.theme('colors')),
						type: 'color',
					},
				);
			},
		},
	],
};
