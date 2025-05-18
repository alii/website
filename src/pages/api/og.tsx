import {findLargestUsableFontSize} from '@altano/satori-fit-text';
import {unstable_createNodejsStream} from '@vercel/og';
import type {NextApiRequest, NextApiResponse, ServerRuntime} from 'next';
import type {Font} from 'satori';
import {posts} from '../../blog/posts';

export const runtime: ServerRuntime = 'nodejs';

async function loadGoogleFont(font: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}`;
	const css = await (await fetch(url)).text();
	const resource = /src: url\((.+)\) format\('(opentype|truetype)'\)/.exec(css);

	const fontResourceUrl = resource?.[1];

	if (fontResourceUrl) {
		const response = await fetch(fontResourceUrl);

		if (response.status === 200) {
			return response.arrayBuffer();
		}
	}

	throw new Error('failed to load font data');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {slug} = req.query;

	if (typeof slug !== 'string') {
		res.status(400).send('Missing slug');
		return;
	}

	const post = posts.find(p => p.slug === slug);

	if (!post) {
		res.status(404).send('Not found');
		return;
	}

	const MONO: Font = {
		name: 'JetBrains Mono',
		data: await loadGoogleFont('JetBrains+Mono'),
		style: 'normal',
	};

	const SANS_SERIF: Font = {
		name: 'Geist',
		data: await loadGoogleFont('Geist'),
		style: 'normal',
	};

	const dimensions = {
		width: 1200,
		height: 630,
	};

	const xPadding = 60;

	const excerptFontSize = await findLargestUsableFontSize({
		text: post.excerpt,
		font: MONO,
		maxWidth: dimensions.width - xPadding * 2,
		maxHeight: (dimensions.height / 3) * 1.5,
		lineHeight: 1.2,
	});

	const titleFontSize = await findLargestUsableFontSize({
		text: post.name,
		font: SANS_SERIF,
		maxWidth: dimensions.width - xPadding * 2,
		maxHeight: (dimensions.height / 3) * 0.5,
		maxFontSize: Math.ceil(excerptFontSize - 12),
	});

	const node = (
		<div
			tw="flex flex-col justify-center items-start w-full h-full text-zinc-400 font-mono"
			style={{
				padding: `0px ${xPadding}px`,
				backgroundColor: '#030712',
			}}
		>
			<div
				tw="font-bold mb-6 leading-tight"
				style={{fontSize: titleFontSize, fontFamily: `${SANS_SERIF.name}, sans-serif`}}
			>
				{post.name}
			</div>
			<div
				tw="font-normal text-white"
				style={{fontSize: excerptFontSize, lineHeight: 1.2, fontFamily: `${MONO.name}, monospace`}}
			>
				{post.excerpt}
			</div>
			<div
				tw="text-[35px] text-zinc-500 mt-10"
				style={{fontFamily: `${SANS_SERIF.name}, sans-serif`}}
			>
				alistair.blog
			</div>
		</div>
	);

	const stream = await unstable_createNodejsStream(node, {
		width: 1200,
		height: 630,
		fonts: [MONO, SANS_SERIF],
	});

	res.setHeader('Content-Type', 'image/png');
	res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
	res.statusCode = 200;
	res.statusMessage = 'OK';

	stream.pipe(res);
}
