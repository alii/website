/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,

	swcMinify: true,

	images: {
		domains: [
			'source.unsplash.com',
			'lastfm.freetls.fastly.net',
			'i.scdn.co',
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
			{
				source: '/desu',
				destination: 'https://www.youtube.com/watch?v=HotGxCSas6A',
				permanent: true,
			},
			{
				source: '/10',
				destination: 'https://youtu.be/G5HcvgepK-I',
				permanent: true,
			},
			{
				source: '/lulzsec',
				destination: 'https://www.youtube.com/watch?v=DurOYPdXyF4',
				permanent: true,
			},
			{
				source: '/wheels',
				destination: 'https://www.youtube.com/watch?v=9xRFN2i1cwQ',
				permanent: true,
			},
		];
	},
};
