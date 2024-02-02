import {config as dotenv} from 'dotenv';

// @ts-check

/** @type {import("next").NextConfig} */
const config = {
	env: dotenv().parsed,

	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.scdn.co',
				pathname: '/image/*',
			},

			{
				protocol: 'https',
				hostname: 'snapshot.apple-mapkit.com',
				pathname: '/api/v1/snapshot',
			},
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
			{
				source: '/letterone',
				destination: 'https://hyperfollow.com/alistair6/letter100-3',
				permanent: true,
			},
{
				source: '/live-25-01-2024',
				destination: 'https://www.youtube.com/watch?v=OvTy9xYH7LA',
				permanent: true,
			},
			{
				source: '/live-02-02-2024',
				destination: 'https://drive.google.com/file/d/1SH6fezEnrAhQQmzEN5rPctWsKauWnPkz/view?usp=drive_link',
				permanent: true,
			},
		];
	},
};

export default config;
