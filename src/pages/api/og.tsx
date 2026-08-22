import {findLargestUsableFontSize, type Font} from '@altano/satori-fit-text';
import type {NextApiRequest, NextApiResponse, ServerRuntime} from 'next';
import satori from 'satori';
import sharp from 'sharp';
import {posts} from '../../blog/posts';

export const runtime: ServerRuntime = 'nodejs';

/** Site palette, from globals.css. Warm paper rather than the cold slate we used before. */
const PAPER = '#faf8f4';
const INK = '#292524';
const MUTED = '#57534e';
const FAINT = '#78716c';
const ACCENT = '#9a3412';

const DIMENSIONS = {width: 1200, height: 630};
const PADDING = 60;
const CONTENT_WIDTH = DIMENSIONS.width - PADDING * 2;

/**
 * Satori supports TTF/OTF/WOFF but not WOFF2, so the self-hosted fonts in
 * `public/fonts` are unusable here. Requesting Google Fonts without a browser
 * user-agent gets us TTF back instead, which satori can read.
 */
async function loadGoogleFont(family: string, weight: number) {
	const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`;
	const css = await (await fetch(url)).text();
	const resource = /src: url\((.+)\) format\('(opentype|truetype)'\)/.exec(css);

	const fontResourceUrl = resource?.[1];

	if (fontResourceUrl) {
		const response = await fetch(fontResourceUrl);

		if (response.status === 200) {
			return response.arrayBuffer();
		}
	}

	throw new Error(`failed to load font data for ${family} ${weight}`);
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

	const [loraBold, karlaRegular, karlaSemibold] = await Promise.all([
		loadGoogleFont('Lora', 700),
		loadGoogleFont('Karla', 400),
		loadGoogleFont('Karla', 600),
	]);

	const SERIF: Font = {name: 'Lora', data: loraBold, weight: 700, style: 'normal'};
	const SANS: Font = {name: 'Karla', data: karlaRegular, weight: 400, style: 'normal'};
	const SANS_BOLD: Font = {name: 'Karla', data: karlaSemibold, weight: 600, style: 'normal'};

	// The title is the hero, so it gets sized first and the excerpt is capped
	// against it. Doing this the other way round is what made excerpts loom
	// larger than the titles they belong to.
	const titleFontSize = await findLargestUsableFontSize({
		text: post.name,
		font: SERIF,
		maxWidth: CONTENT_WIDTH,
		maxHeight: 272,
		lineHeight: 1.15,
		// short titles get to be huge; maxHeight keeps multi-line ones in check
		maxFontSize: 150,
	});

	const excerptFontSize = await findLargestUsableFontSize({
		text: post.excerpt,
		font: SANS,
		// NOTE: a fractional maxWidth makes findLargestUsableFontSize return 1.
		maxWidth: Math.floor(CONTENT_WIDTH * 0.96),
		maxHeight: 152,
		lineHeight: 1.4,
		maxFontSize: Math.min(46, Math.round(titleFontSize * 0.46)),
	});

	const node = (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: '100%',
				height: '100%',
				padding: PADDING,
				backgroundColor: PAPER,
				fontFamily: 'Karla, sans-serif',
			}}
		>
			{/* brand mark — the slug trails off dimmer, like a browser address */}
			<div style={{display: 'flex', alignItems: 'center'}}>
				<div style={{width: 20, height: 20, backgroundColor: ACCENT, marginRight: 18}} />
				<div style={{display: 'flex', fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em'}}>
					<div style={{color: INK}}>alistair.sh</div>
					<div style={{color: FAINT}}>{`/${post.slug}`}</div>
				</div>
			</div>

			{/* the post itself */}
			<div style={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
				<div
					style={{
						fontFamily: 'Lora, serif',
						fontWeight: 700,
						fontSize: titleFontSize,
						lineHeight: 1.15,
						letterSpacing: '-0.02em',
						color: INK,
					}}
				>
					{post.name}
				</div>
				<div
					style={{
						marginTop: 30,
						fontSize: excerptFontSize,
						lineHeight: 1.4,
						color: MUTED,
						letterSpacing: '-0.01em',
					}}
				>
					{post.excerpt}
				</div>
			</div>
		</div>
	);

	const svg = await satori(node, {
		width: DIMENSIONS.width,
		height: DIMENSIONS.height,
		fonts: [SERIF, SANS, SANS_BOLD],
	});

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	res.setHeader('Content-Type', 'image/png');
	res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
	res.statusCode = 200;
	res.statusMessage = 'OK';

	res.end(png);
}
