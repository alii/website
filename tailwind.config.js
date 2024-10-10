// @ts-check

const defaultTheme = require('tailwindcss/defaultTheme');
const {default: flattenColorPalette} = require('tailwindcss/lib/util/flattenColorPalette');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./{src,app}/**/*.{ts,tsx}'],
	theme: {
		fontFamily: {
			sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
			serif: ['var(--font-serif)', ...defaultTheme.fontFamily.serif],
		},
		extend: {
			colors: {
				blurple: '#5865F2',
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		{
			handler: tw => {
				tw.matchComponents(
					{
						'bg-grid': value => ({
							backgroundSize: '90px 90px',
							backgroundImage: `
								linear-gradient(to right, ${value} 1px, transparent 1px),
								linear-gradient(to bottom, ${value} 1px, transparent 1px)
							`,
						}),
					},
					{
						values: flattenColorPalette(tw.theme('colors')),
						type: 'color',
					},
				);

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

				tw.matchUtilities(
					{
						'nice-underline': value => ({
							'position': 'relative',
							'zIndex': '0',
							'&:before': {
								'zIndex': '-1',
								'content': "''",
								'position': 'absolute',
								'bottom': '0.4px',
								'left': '1.5px',
								'right': '1.5px',
								'border-bottom': `1.8px solid ${value}`,
							},
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
