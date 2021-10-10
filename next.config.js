// eslint-disable-next-line unicorn/prefer-module
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
};
