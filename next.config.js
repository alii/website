// eslint-disable-next-line unicorn/prefer-module
/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	experimental: {
		turboMode: true,
	},
	future: {
		strictPostcssConfiguration: true,
	},
	images: {
		domains: [
			'source.unsplash.com',
			'lastfm.freetls.fastly.net',
			'cdn.discordapp.com',
		],
	},
	async redirects() {
		return [
			{
				source: '/outro',
				destination: 'https://www.youtube.com/watch?v=HeF11Av9WuU',
				permanent: true,
			},
		];
	},
};
