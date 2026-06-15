import {createCanvas, loadImage} from '@napi-rs/canvas';
import gifenc from 'gifenc';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const {applyPalette, GIFEncoder, quantize} = gifenc;

const W = 88;
const H = 31;
const FONT = 'Verdana, Geneva, sans-serif';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'public', '88x31');
mkdirSync(OUT, {recursive: true});

const bunLogo = await loadImage(readFileSync(join(HERE, 'assets', 'bun.svg')));
const clawdInvert = await loadImage(readFileSync(join(HERE, 'assets', 'clawd-invert.svg')));

const TAU = Math.PI * 2;
/** @param {number} v */
const clamp = v => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * Creates a deterministic pseudo-random number generator using a linear
 * congruential generator (LCG). Seeding with the same value always produces
 * the same sequence, which keeps per-frame noise stable across re-renders.
 *
 * @param {number} seed - Integer seed value; only the lower 32 bits are used.
 * @returns {() => number} A zero-argument function that returns a float in [0, 1).
 */
function rng(seed) {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 0xffffffff;
	};
}

/**
 * Sets the canvas font, using the shared FONT stack.
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} x - The 2D rendering context to mutate.
 * @param {number} px - Font size in pixels.
 * @param {boolean} [bold=true] - Whether to use bold weight.
 * @returns {void}
 */
function setFont(x, px, bold = true) {
	x.font = `${bold ? 'bold ' : ''}${px}px ${FONT}`;
}

/**
 * Draws a string (or individual characters with custom per-character colour)
 * onto the canvas. Supports optional letter-spacing, stroke outline, and
 * per-character colour functions for rainbow effects.
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} x - The 2D rendering context.
 * @param {string} str - The string to render.
 * @param {object} [opts] - Optional rendering options.
 * @param {number} [opts.px=9] - Font size in pixels.
 * @param {string|((i: number) => string)} [opts.color='#fff'] - Fill colour; may be a
 *   function `(charIndex) => cssColor` for per-character colouring.
 * @param {number} [opts.y=H/2] - Vertical centre of the text baseline in pixels.
 * @param {number} [opts.cx=W/2] - Horizontal centre anchor in pixels.
 * @param {number} [opts.spacing=0] - Extra pixels of spacing inserted between characters.
 *   When > 0 each character is placed individually; when 0 the string is drawn as a unit.
 * @param {string|null} [opts.stroke=null] - Optional stroke colour for a text outline.
 * @param {boolean} [opts.bold=true] - Whether to use bold weight.
 * @param {number} [opts.alpha=1] - Global alpha applied for this draw call (0..1).
 * @returns {void}
 */
function text(
	x,
	str,
	{
		px = 9,
		color = '#fff',
		y = H / 2,
		cx = W / 2,
		spacing = 0,
		stroke = null,
		bold = true,
		alpha = 1,
	} = {},
) {
	setFont(x, px, bold);
	x.textBaseline = 'middle';
	x.globalAlpha = alpha;
	const chars = [...str];

	if (spacing > 0) {
		x.textAlign = 'left';
		const widths = chars.map(c => x.measureText(c).width);
		const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
		let px0 = cx - total / 2;
		for (let i = 0; i < chars.length; i++) {
			if (stroke) {
				x.lineWidth = 2;
				x.strokeStyle = stroke;
				x.strokeText(chars[i], px0, y);
			}
			x.fillStyle = typeof color === 'function' ? color(i) : color;
			x.fillText(chars[i], px0, y);
			px0 += widths[i] + spacing;
		}
	} else {
		x.textAlign = 'center';
		if (stroke) {
			x.lineWidth = 2;
			x.strokeStyle = stroke;
			x.strokeText(str, cx, y);
		}
		x.fillStyle = typeof color === 'string' ? color : '#fff';
		x.fillText(str, cx, y);
	}

	x.globalAlpha = 1;
}

/**
 * Paints a classic Windows-style bevel highlight around the canvas edges:
 * a light top/left edge simulating a raised surface and a dark bottom/right
 * edge simulating a shadow.
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} x - The 2D rendering context.
 * @returns {void}
 */
function bevel(x) {
	x.fillStyle = 'rgba(255,255,255,0.45)';
	x.fillRect(0, 0, W, 1);
	x.fillRect(0, 0, 1, H);
	x.fillStyle = 'rgba(0,0,0,0.5)';
	x.fillRect(0, H - 1, W, 1);
	x.fillRect(W - 1, 0, 1, H);
}

/**
 * Strokes a single-pixel rectangular border around the full canvas area.
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} x - The 2D rendering context.
 * @param {string} [color='#000'] - CSS colour string for the border stroke.
 * @returns {void}
 */
function border(x, color = '#000') {
	x.strokeStyle = color;
	x.lineWidth = 1;
	x.strokeRect(0.5, 0.5, W - 1, H - 1);
}

// 4x4 ordered (Bayer) dither — nudges pixels pre-quantize so gradients break up
// into that classic stippled banding instead of smooth ramps.
const BAYER = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
];

/**
 * Applies a 4x4 ordered (Bayer matrix) dither pass directly to raw RGBA pixel
 * data. Each pixel's RGB channels are nudged up or down by a threshold derived
 * from the Bayer matrix before palette quantisation, producing the classic
 * stippled banding effect instead of flat colour ramps.
 *
 * @param {Uint8ClampedArray} data - Raw RGBA pixel buffer (length = W * H * 4).
 *   Modified in-place.
 * @param {number} [amount=28] - Maximum per-channel offset applied by the dither.
 *   Higher values produce more aggressive banding.
 * @returns {void}
 */
function dither(data, amount = 28) {
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			const t = (BAYER[y & 3][x & 3] / 15 - 0.5) * amount;
			const i = (y * W + x) * 4;
			data[i] = clamp(data[i] + t);
			data[i + 1] = clamp(data[i + 1] + t);
			data[i + 2] = clamp(data[i + 2] + t);
		}
	}
}

/**
 * Fills a circle on the canvas at the given centre and radius using the
 * current `fillStyle`. A convenience wrapper around `arc` + `fill`.
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} x - The 2D rendering context.
 * @param {number} cx - Centre X coordinate in pixels.
 * @param {number} cy - Centre Y coordinate in pixels.
 * @param {number} r - Radius in pixels.
 * @returns {void}
 */
function circle(x, cx, cy, r) {
	x.beginPath();
	x.arc(cx, cy, r, 0, TAU);
	x.fill();
}

// The Anthropic "spark" — a spiky, slightly-uneven asterisk burst.
/**
 * Draws the Anthropic "spark" logo: an asterisk-like burst of 11 irregular
 * triangular spikes radiating from a filled centre circle. Spike lengths are
 * randomised with a seeded RNG so the shape is consistent across frames.
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} x - The 2D rendering context.
 * @param {number} cx - Centre X coordinate of the spark in pixels.
 * @param {number} cy - Centre Y coordinate of the spark in pixels.
 * @param {number} R - Outer radius controlling overall size of the burst.
 * @param {number} rot - Rotation angle in radians applied to the whole burst.
 * @param {string} color - CSS colour string for the fill.
 * @returns {void}
 */
function drawSpark(x, cx, cy, R, rot, color) {
	const r = rng(2024);
	const n = 11;
	x.save();
	x.translate(cx, cy);
	x.rotate(rot);
	x.fillStyle = color;
	for (let i = 0; i < n; i++) {
		const len = R * (0.7 + 0.55 * r());
		const bw = R * 0.18 * (0.8 + 0.5 * r());
		x.save();
		x.rotate((i / n) * TAU);
		x.beginPath();
		x.moveTo(-bw, 0);
		x.lineTo(bw, 0);
		x.lineTo(0, -len);
		x.closePath();
		x.fill();
		x.restore();
	}
	circle(x, 0, 0, R * 0.24);
	x.restore();
}

// Clawd — the Claude Code mascot — built from the real vector. The source SVG is
// an inverse mask (black background, Clawd cut out as transparent, eyes as black
// holes). We rasterise it, crop to Clawd's tight bounding box (drops the padding),
// threshold the alpha for crisp straight edges, then recolour: clay where the
// body was, fully transparent everywhere else (eyes included, so they read dark
// on the button). Result is a pre-rendered sprite blitted with drawImage.
const CLAY = [0xcf, 0x6d, 0x4e];

/**
 * Builds a pre-rendered off-screen sprite of the Clawd mascot at the requested
 * height. The source SVG (`clawd-invert.svg`) is an inverse mask — transparent
 * pixels are the body, opaque pixels are background/eye holes. This function:
 *
 * 1. Rasterises the SVG at native resolution to locate the tight bounding box of
 *    the body (transparent region).
 * 2. Re-renders at 4× super-sample to keep edges and thin eye slits crisp.
 * 3. Thresholds alpha: body pixels become the clay colour (opaque), everything
 *    else becomes fully transparent (so eyes appear dark on the button).
 *
 * @param {number} targetH - Desired height of the output sprite in pixels.
 * @returns {{canvas: import('@napi-rs/canvas').Canvas, w: number, h: number}}
 *   An object containing the off-screen canvas with the colourised sprite and
 *   its display dimensions (`w`, `h`) at `targetH`.
 */
function buildClawdSprite(targetH) {
	// rasterise at native resolution to find the body's bounding box
	const NW = clawdInvert.width;
	const NH = clawdInvert.height;
	const probe = createCanvas(NW, NH);
	const pctx = probe.getContext('2d');
	pctx.drawImage(clawdInvert, 0, 0);
	const pd = pctx.getImageData(0, 0, NW, NH).data;

	let minX = NW;
	let minY = NH;
	let maxX = -1;
	let maxY = -1;
	for (let y = 0; y < NH; y++) {
		for (let xx = 0; xx < NW; xx++) {
			if (pd[(y * NW + xx) * 4 + 3] < 128) {
				// transparent in source = Clawd body
				if (xx < minX) minX = xx;
				if (xx > maxX) maxX = xx;
				if (y < minY) minY = y;
				if (y > maxY) maxY = y;
			}
		}
	}
	const bw = maxX - minX + 1;
	const bh = maxY - minY + 1;

	// Render + threshold at 4x so the body edges stay crisp/straight and the thin
	// eye slits survive; the button then blits it scaled down (smooth) to size.
	const SS = 4;
	const iw = Math.round((targetH * SS * bw) / bh);
	const ih = targetH * SS;
	const sprite = createCanvas(iw, ih);
	const sx = sprite.getContext('2d');
	sx.drawImage(clawdInvert, minX, minY, bw, bh, 0, 0, iw, ih);

	const id = sx.getImageData(0, 0, iw, ih);
	const d = id.data;
	for (let i = 0; i < d.length; i += 4) {
		if (d[i + 3] < 128) {
			// body → clay, opaque
			d[i] = CLAY[0];
			d[i + 1] = CLAY[1];
			d[i + 2] = CLAY[2];
			d[i + 3] = 255;
		} else {
			// background + eye holes → transparent
			d[i + 3] = 0;
		}
	}
	sx.putImageData(id, 0, 0);

	return {canvas: sprite, w: Math.round((targetH * bw) / bh), h: targetH};
}

const CLAWD = buildClawdSprite(20);

/**
 * Blits the pre-rendered Clawd sprite onto the button canvas at the given
 * top-left offset. Uses the display dimensions stored on the global `CLAWD`
 * object so callers do not need to track sprite size.
 *
 * @param {import('@napi-rs/canvas').SKRSContext2D} x - The 2D rendering context.
 * @param {number} ox - Left edge X offset in pixels.
 * @param {number} oy - Top edge Y offset in pixels.
 * @returns {void}
 */
function drawClawd(x, ox, oy) {
	x.drawImage(CLAWD.canvas, ox, oy, CLAWD.w, CLAWD.h);
}

// ----------------------------------------------------------------------------
// Button definitions. Each `draw(x, p, f)` renders one frame:
//   x — the SKRSContext2D for the 88×31 canvas
//   p — loop phase in [0, 1): 0 = start of loop, 1 = end (exclusive), so
//       animations driven by `p` are automatically seamless
//   f — integer frame index (0-based), useful for discrete on/off flicker
//       effects or decisions that need the raw frame number
// Animations are periodic over p so they loop seamlessly.
// ----------------------------------------------------------------------------

/**
 * @typedef {Object} ButtonSpec
 * @property {string} id - Filename stem; the GIF is written to `public/88x31/{id}.gif`.
 * @property {string} alt - Accessible alt text / tooltip for the rendered button.
 * @property {string} [href] - Optional destination URL when the button is used as a link.
 * @property {number} frames - Total number of animation frames to render.
 * @property {number} delay - Per-frame delay in milliseconds (GIF timing).
 * @property {number} colors - Palette size passed to the quantiser (max distinct colours).
 * @property {boolean} [dither] - When true, a Bayer dither pass is applied before
 *   quantisation to break up colour banding on gradients.
 * @property {(x: import('@napi-rs/canvas').SKRSContext2D, p: number, f: number) => void} draw
 *   Frame renderer. Called once per frame with the 2D context (`x`), the
 *   normalised loop phase `p` (0..1), and the integer frame index `f`.
 */

/** @type {ButtonSpec[]} */
const BUTTONS = [
	{
		id: 'alistair',
		alt: "alistair.sh — Alistair's homepage",
		href: '/',
		frames: 36,
		delay: 70,
		colors: 24,
		draw(x, p) {
			x.fillStyle = '#101012';
			x.fillRect(0, 0, W, H);
			// orange tab
			x.fillStyle = '#f48024';
			x.fillRect(0, 0, 20, H);
			text(x, 'A', {px: 16, color: '#fff', y: H / 2 - 1, cx: 10});
			// shining title, centred in the right region (20..88)
			const tcx = (20 + W) / 2;
			text(x, 'ALISTAIR.SH', {px: 8, color: '#9aa0a6', cx: tcx, spacing: 0.2});
			const sweep = p * (W + 30) - 15;
			x.save();
			x.beginPath();
			x.rect(sweep - 9, 0, 18, H);
			x.clip();
			text(x, 'ALISTAIR.SH', {px: 8, color: '#ffffff', cx: tcx, spacing: 0.2});
			x.restore();
			border(x, '#000');
		},
	},

	{
		id: 'under-construction',
		alt: 'under construction',
		frames: 24,
		delay: 90,
		colors: 8,
		draw(x, p, f) {
			// scrolling hazard stripes
			const shift = (p * 24) % 24;
			for (let i = -2; i < W / 6 + 2; i++) {
				x.fillStyle = i % 2 === 0 ? '#f5c400' : '#1a1a1b';
				x.save();
				x.beginPath();
				x.moveTo(i * 12 + shift, 0);
				x.lineTo(i * 12 + 12 + shift, 0);
				x.lineTo(i * 12 + 12 + shift - H, H);
				x.lineTo(i * 12 + shift - H, H);
				x.closePath();
				x.fill();
				x.restore();
			}
			// center plate
			x.fillStyle = '#1a1a1b';
			x.fillRect(3, 8, W - 6, 15);
			const on = f % 8 < 5;
			text(x, 'UNDER', {px: 8, color: on ? '#ffd400' : '#7a6400', y: 13});
			text(x, 'CONSTRUCTION', {px: 8, color: on ? '#ffd400' : '#7a6400', y: 20});
			border(x, '#000');
		},
	},

	{
		id: 'typescript',
		alt: 'typed or die — TypeScript',
		href: 'https://www.typescriptlang.org',
		frames: 40,
		delay: 70,
		colors: 48,
		draw(x, p) {
			x.fillStyle = '#0f1115';
			x.fillRect(0, 0, W, H);
			x.fillStyle = '#3178c6';
			x.fillRect(0, 0, 22, H);
			text(x, 'TS', {px: 13, color: '#fff', y: H / 2, cx: 11});
			// per-letter rainbow that scrolls hue fast around the loop
			text(x, 'TYPESCRIPT', {
				px: 8,
				y: H / 2,
				cx: (22 + W) / 2,
				spacing: 0.4,
				color: i => `hsl(${Math.round((i * 40 + p * 720) % 360)},100%,62%)`,
			});
			border(x, '#000');
		},
	},

	{
		id: 'plasma-vibes',
		alt: '100% vibes',
		frames: 36,
		delay: 70,
		colors: 96,
		dither: true,
		draw(x, p) {
			const img = x.createImageData(W, H);
			const d = img.data;
			const t = p * TAU;
			for (let y = 0; y < H; y++) {
				for (let xx = 0; xx < W; xx++) {
					const v =
						Math.sin(xx / 6 + t) +
						Math.sin(y / 4 - t * 1.3) +
						Math.sin((xx + y) / 8 + t) +
						Math.sin(Math.hypot(xx - 44, y - 15) / 5 - t * 1.6);
					const h = ((v + 4) / 8) * 360 + p * 360;
					const [r, g, b] = hsl(h, 100, 55);
					const i = (y * W + xx) * 4;
					d[i] = r;
					d[i + 1] = g;
					d[i + 2] = b;
					d[i + 3] = 255;
				}
			}
			x.putImageData(img, 0, 0);
			text(x, 'VIBES', {px: 14, color: '#fff', stroke: '#000', spacing: 1});
			border(x, '#000');
		},
	},

	{
		id: 'claude-code',
		alt: 'built with Claude Code',
		href: 'https://www.claude.com/product/claude-code',
		frames: 40,
		delay: 80,
		colors: 32,
		draw(x, p, f) {
			const g = x.createLinearGradient(0, 0, 0, H);
			g.addColorStop(0, '#2c1b14');
			g.addColorStop(1, '#181010');
			x.fillStyle = g;
			x.fillRect(0, 0, W, H);
			// spinning Anthropic spark, top-right
			drawSpark(x, 80, 7, 6, p * TAU * 0.6, 'rgba(217,119,87,0.95)');
			// Clawd, gently bobbing
			const bob = Math.round(Math.sin(p * TAU) * 1.2);
			drawClawd(x, 4, Math.round((H - CLAWD.h) / 2) + bob);
			const tcx = (4 + CLAWD.w + 6 + W) / 2;
			text(x, 'CLAUDE', {px: 9, color: '#fff', y: 11, cx: tcx});
			text(x, 'CODE', {px: 9, color: '#e08a6f', y: 21, cx: tcx});
			border(x, '#7d3b27');
		},
	},

	{
		id: 'powered-by-bun',
		alt: 'powered by Bun',
		href: 'https://bun.com',
		frames: 36,
		delay: 75,
		colors: 32,
		dither: true,
		draw(x, p) {
			const g = x.createLinearGradient(0, 0, 0, H);
			g.addColorStop(0, '#fffaf0');
			g.addColorStop(1, '#f3e2c0');
			x.fillStyle = g;
			x.fillRect(0, 0, W, H);
			// the real Bun logo, gently bobbing
			const lw = 22;
			const lh = (lw * bunLogo.height) / bunLogo.width;
			const bob = Math.sin(p * TAU) * 2;
			x.drawImage(bunLogo, 4, (H - lh) / 2 + bob, lw, lh);
			const tcx = (28 + W) / 2;
			text(x, 'POWERED BY', {px: 7, color: '#9a6b1f', y: 10, cx: tcx});
			text(x, 'BUN', {px: 13, color: '#14151a', y: 20, cx: tcx});
			border(x, '#caa25a');
		},
	},

	{
		id: 'this-is-fine',
		alt: 'this is fine',
		frames: 30,
		delay: 70,
		colors: 64,
		dither: true,
		draw(x, p) {
			const t = p * TAU;
			const img = x.createImageData(W, H);
			const d = img.data;
			for (let y = 0; y < H; y++) {
				for (let xx = 0; xx < W; xx++) {
					const base = (H - y) / H; // hotter toward the bottom
					const flick =
						0.4 * Math.sin(xx / 4 + t * 3) +
						0.3 * Math.sin(xx / 2.3 - t * 5) +
						0.25 * Math.sin((xx + y) / 3 + t * 4);
					let v = base * 1.35 + flick - 0.15;
					v = v < 0 ? 0 : v > 1 ? 1 : v;
					const i = (y * W + xx) * 4;
					d[i] = clamp(v * 3 * 255);
					d[i + 1] = clamp((v - 0.33) * 3 * 255);
					d[i + 2] = clamp((v - 0.72) * 3 * 255);
					d[i + 3] = 255;
				}
			}
			x.putImageData(img, 0, 0);
			text(x, 'THIS IS FINE', {px: 9, color: '#fff', stroke: '#3a0d00', y: H / 2});
			border(x, '#000');
		},
	},

	{
		id: 'star-wars',
		alt: 'a long time ago in a galaxy far, far away',
		frames: 40,
		delay: 90,
		colors: 24,
		draw(x, p) {
			x.fillStyle = '#000';
			x.fillRect(0, 0, W, H);
			// starfield
			const r = rng(99);
			for (let i = 0; i < 55; i++) {
				const sx = Math.floor(r() * W);
				const sy = Math.floor(r() * H);
				const b = 110 + Math.floor(r() * 145);
				x.fillStyle = `rgb(${b},${b},${b})`;
				x.fillRect(sx, sy, 1, 1);
			}
			// the logo flies in, recedes into the distance, and fades — on a loop
			const k = p;
			const scale = 1.35 - k * 1.08;
			const cy = H * 0.72 - k * H * 0.85;
			const alpha = Math.min(1, k * 6) * Math.max(0, 1 - k);
			if (scale > 0.05) {
				x.save();
				x.globalAlpha = alpha;
				x.translate(W / 2, cy);
				x.scale(scale, scale);
				x.fillStyle = '#ffe81f';
				setFont(x, 11);
				x.textAlign = 'center';
				x.textBaseline = 'middle';
				x.fillText('STAR', 0, -6);
				x.fillText('WARS', 0, 6);
				x.restore();
			}
			border(x, '#0a0a1a');
		},
	},

	{
		id: 'now-spinning',
		alt: 'now spinning — on the decks',
		href: 'https://soundcloud.com/alistairsmusic',
		frames: 24,
		delay: 55,
		colors: 16,
		draw(x, p) {
			x.fillStyle = '#15131a';
			x.fillRect(0, 0, W, H);
			const cx = 16;
			const cy = 16;
			const R = 12;
			// record
			x.fillStyle = '#0a0a0a';
			circle(x, cx, cy, R);
			x.strokeStyle = '#2b2b2b';
			x.lineWidth = 1;
			for (const rr of [10, 8, 6]) {
				x.beginPath();
				x.arc(cx, cy, rr, 0, TAU);
				x.stroke();
			}
			// rotating sheen marks (convey spin)
			const a = p * TAU;
			x.strokeStyle = '#5a5a5a';
			x.lineWidth = 1.5;
			for (const off of [0, Math.PI]) {
				x.beginPath();
				x.moveTo(cx, cy);
				x.lineTo(cx + Math.cos(a + off) * R, cy + Math.sin(a + off) * R);
				x.stroke();
			}
			// label + spindle
			x.fillStyle = '#e0533a';
			circle(x, cx, cy, 4);
			x.fillStyle = '#15131a';
			circle(x, cx, cy, 1);
			const tcx = (32 + W) / 2;
			text(x, 'NOW', {px: 9, color: '#fff', y: 10, cx: tcx});
			text(x, 'SPINNING', {px: 9, color: '#7fc4ff', y: 20, cx: tcx});
			border(x, '#000');
		},
	},

	{
		id: 'live-set',
		alt: 'live set — made in Ableton Live',
		href: 'https://soundcloud.com/alistairsmusic',
		frames: 30,
		delay: 60,
		colors: 32,
		draw(x, p) {
			x.fillStyle = '#0e0e11';
			x.fillRect(0, 0, W, H);
			// bouncing equalizer
			const n = 18;
			const bw = W / n;
			for (let i = 0; i < n; i++) {
				const amp =
					((Math.sin(p * TAU * 2 + i * 0.7) + 1) / 2) * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.3)));
				const h = 3 + amp * 20;
				const t = h / 23;
				const col =
					t < 0.5
						? `rgb(${Math.round(t * 2 * 255)},220,40)`
						: `rgb(255,${Math.round((1 - (t - 0.5) * 2) * 220)},40)`;
				x.fillStyle = col;
				x.fillRect(i * bw + 0.5, H - 1 - h, bw - 1, h);
			}
			text(x, 'LIVE SET', {px: 12, color: '#fff', stroke: '#000', y: 11, spacing: 1});
			border(x, '#000');
		},
	},

	{
		id: 'strict-mode',
		alt: 'strict mode — no errors',
		href: '/strict-tsconfig',
		frames: 24,
		delay: 90,
		colors: 12,
		draw(x, p) {
			x.fillStyle = '#0d1117';
			x.fillRect(0, 0, W, H);
			const pulse = 0.6 + 0.4 * Math.sin(p * TAU);
			x.strokeStyle = `rgba(63,224,110,${pulse})`;
			x.lineWidth = 3;
			x.lineCap = 'round';
			x.beginPath();
			x.moveTo(7, 16);
			x.lineTo(12, 21);
			x.lineTo(22, 9);
			x.stroke();
			const tcx = (28 + W) / 2;
			text(x, 'STRICT MODE', {px: 8, color: '#e6edf3', y: 10, cx: tcx});
			text(x, '0 ERRORS', {px: 9, color: `rgba(63,224,110,${pulse})`, y: 20, cx: tcx});
			border(x, '#1f6feb');
		},
	},

	{
		id: 'zero-kb',
		alt: '0kb bundle',
		href: '/zero-kb-nextjs-blog',
		frames: 30,
		delay: 70,
		colors: 16,
		draw(x, p) {
			const g = x.createLinearGradient(0, 0, 0, H);
			g.addColorStop(0, '#101826');
			g.addColorStop(1, '#0a0f17');
			x.fillStyle = g;
			x.fillRect(0, 0, W, H);
			const kb = Math.max(0, Math.round(150 - p * 210));
			const done = kb === 0;
			text(x, 'BUNDLE SIZE', {px: 8, color: '#8aa0b6', y: 9});
			text(x, done ? '0kb !!' : `${kb}kb`, {
				px: 13,
				color: done ? '#39d98a' : '#ffffff',
				y: 20,
				stroke: '#04130b',
			});
			border(x, '#39d98a');
		},
	},

	{
		id: 'shipped-it',
		alt: 'shipped it on Vercel',
		href: '/serverless-discord-oauth',
		frames: 30,
		delay: 70,
		colors: 12,
		draw(x, p) {
			x.fillStyle = '#000';
			x.fillRect(0, 0, W, H);
			const ry = 19 - 6 * (0.5 + 0.5 * Math.sin(p * TAU));
			x.fillStyle = '#fff';
			x.beginPath();
			x.moveTo(14, ry - 7);
			x.lineTo(21, ry + 6);
			x.lineTo(7, ry + 6);
			x.closePath();
			x.fill();
			x.fillStyle = `rgba(255,140,0,${0.4 + 0.6 * Math.abs(Math.sin(p * TAU * 4))})`;
			x.fillRect(12, ry + 7, 4, 3);
			const tcx = (28 + W) / 2;
			text(x, 'SHIPPED IT', {px: 8, color: '#fff', y: 10, cx: tcx});
			text(x, 'ON VERCEL', {px: 8, color: '#aaa', y: 20, cx: tcx});
			border(x, '#333');
		},
	},

	{
		id: 'read-the-spec',
		alt: 'read the spec',
		href: 'https://tc39.es/ecma262/',
		frames: 24,
		delay: 90,
		colors: 12,
		draw(x, p, f) {
			x.fillStyle = '#020402';
			x.fillRect(0, 0, W, H);
			const on = f % 10 < 7;
			text(x, 'RTFM.', {px: 13, color: on ? '#48ff7e' : '#13351f', y: 11, spacing: 1});
			text(x, '— THE SPEC', {px: 8, color: '#2aa85a', y: 21});
			x.fillStyle = 'rgba(0,0,0,0.4)';
			for (let y = 0; y < H; y += 2) x.fillRect(0, y, W, 1);
			border(x, '#0a3a14');
		},
	},

	{
		id: 'js-on-beam',
		alt: 'JS on the BEAM',
		href: 'https://github.com/alii/arc',
		frames: 28,
		delay: 75,
		colors: 24,
		draw(x, p) {
			x.fillStyle = '#1d0f2b';
			x.fillRect(0, 0, W, H);
			// JavaScript lightning bolt
			x.fillStyle = '#f7df1e';
			x.beginPath();
			x.moveTo(14, 4);
			x.lineTo(8, 17);
			x.lineTo(13, 17);
			x.lineTo(10, 27);
			x.lineTo(20, 13);
			x.lineTo(15, 13);
			x.closePath();
			x.fill();
			// actor message zipping along the bottom
			const mx = 30 + (W - 36) * (p % 1);
			x.fillStyle = '#a06cff';
			circle(x, mx, 27, 1.5);
			const tcx = (26 + W) / 2;
			text(x, 'JS ON', {px: 9, color: '#fff', y: 10, cx: tcx});
			text(x, 'THE BEAM', {px: 9, color: '#c9a6ff', y: 20, cx: tcx});
			border(x, '#a4123f');
		},
	},

	{
		id: 'made-a-lang',
		alt: 'I made a lang',
		href: 'https://github.com/alii/al',
		frames: 40,
		delay: 60,
		colors: 12,
		draw(x, p) {
			x.fillStyle = '#0d1117';
			x.fillRect(0, 0, W, H);
			const msg = 'SRC -> AST -> IR -> BIN -> ';
			setFont(x, 8);
			x.textBaseline = 'middle';
			x.textAlign = 'left';
			x.fillStyle = '#39d98a';
			const tw = x.measureText(msg).width;
			const off = -((p * tw) % tw);
			for (let xx = off; xx < W; xx += tw) x.fillText(msg, xx, 8);
			text(x, 'I MADE A LANG', {px: 9, color: '#fff', y: 21});
			border(x, '#1f6feb');
		},
	},

	{
		id: 'now-scrobbling',
		alt: 'now scrobbling — last.fm',
		href: 'https://github.com/alii/use-last-fm',
		frames: 24,
		delay: 70,
		colors: 12,
		draw(x, p) {
			x.fillStyle = '#b90000';
			x.fillRect(0, 0, W, H);
			bevel(x);
			const ny = 16 - 4 * Math.abs(Math.sin(p * TAU));
			x.fillStyle = '#fff';
			circle(x, 10, ny + 4, 2.5);
			x.fillRect(11.5, ny - 4, 1.5, 8);
			const tcx = (24 + W) / 2;
			text(x, 'NOW', {px: 9, color: '#fff', y: 10, cx: tcx});
			text(x, 'SCROBBLING', {px: 9, color: '#ffd0d0', y: 20, cx: tcx});
			border(x, '#600000');
		},
	},

	{
		id: 'anime',
		alt: 'anime',
		frames: 36,
		delay: 80,
		colors: 48,
		draw(x, p) {
			const g = x.createLinearGradient(0, 0, W, H);
			g.addColorStop(0, '#ffd9ec');
			g.addColorStop(1, '#c8e7ff');
			x.fillStyle = g;
			x.fillRect(0, 0, W, H);

			const cx = 44;
			const cy = 16 + Math.sin(p * TAU) * 0.6; // gentle bob
			// hair back + twin tails
			x.fillStyle = '#7b4fe0';
			x.beginPath();
			x.ellipse(cx, cy, 15, 14, 0, 0, TAU);
			x.fill();
			x.beginPath();
			x.ellipse(cx - 15, cy + 4, 4, 9, 0.3, 0, TAU);
			x.fill();
			x.beginPath();
			x.ellipse(cx + 15, cy + 4, 4, 9, -0.3, 0, TAU);
			x.fill();
			// ears
			for (const dir of [-1, 1]) {
				const exx = cx + dir * 8;
				x.fillStyle = '#7b4fe0';
				x.beginPath();
				x.moveTo(exx - 4, cy - 8);
				x.lineTo(exx + 4, cy - 8);
				x.lineTo(exx + dir * 2, cy - 16);
				x.closePath();
				x.fill();
				x.fillStyle = '#ffb3d9';
				x.beginPath();
				x.moveTo(exx - 2, cy - 9);
				x.lineTo(exx + 2, cy - 9);
				x.lineTo(exx + dir * 1.5, cy - 14);
				x.closePath();
				x.fill();
			}
			// face
			x.fillStyle = '#ffe3d0';
			x.beginPath();
			x.ellipse(cx, cy + 2, 9.5, 10, 0, 0, TAU);
			x.fill();
			// bangs + fringe
			x.fillStyle = '#7b4fe0';
			x.beginPath();
			x.ellipse(cx, cy - 5, 10, 6, 0, 0, TAU);
			x.fill();
			for (const fx of [-7, -3.5, 0, 3.5, 7]) {
				x.beginPath();
				x.moveTo(cx + fx - 2.2, cy - 3);
				x.lineTo(cx + fx + 2.2, cy - 3);
				x.lineTo(cx + fx, cy + 2.5);
				x.closePath();
				x.fill();
			}
			// big eyes — left open, right winking ;)
			const ey = cy + 4;
			for (const dir of [-1, 1]) {
				const exx = cx + dir * 4.2;
				if (dir === 1) {
					x.strokeStyle = '#3a0a1e';
					x.lineWidth = 1.3;
					x.beginPath();
					x.arc(exx, ey + 1.6, 2.7, 1.12 * Math.PI, 1.88 * Math.PI);
					x.stroke();
					continue;
				}
				x.fillStyle = '#fff';
				x.beginPath();
				x.ellipse(exx, ey, 2.6, 3.4, 0, 0, TAU);
				x.fill();
				x.fillStyle = '#ff4d8d';
				x.beginPath();
				x.ellipse(exx, ey + 0.5, 1.9, 2.7, 0, 0, TAU);
				x.fill();
				x.fillStyle = '#3a0a1e';
				x.beginPath();
				x.ellipse(exx, ey + 0.7, 1, 1.6, 0, 0, TAU);
				x.fill();
				x.fillStyle = '#fff';
				x.beginPath();
				x.arc(exx - 0.8, ey - 1.2, 0.8, 0, TAU);
				x.fill();
			}
			// blush + smile
			x.fillStyle = 'rgba(255,120,160,0.65)';
			x.beginPath();
			x.ellipse(cx - 6.5, cy + 6, 2.2, 1.3, 0, 0, TAU);
			x.fill();
			x.beginPath();
			x.ellipse(cx + 6.5, cy + 6, 2.2, 1.3, 0, 0, TAU);
			x.fill();
			x.strokeStyle = '#c0395f';
			x.lineWidth = 1;
			x.beginPath();
			x.arc(cx, cy + 7.5, 1.6, 0.15 * Math.PI, 0.85 * Math.PI);
			x.stroke();

			// falling sakura petals in front
			const r = rng(77);
			for (let i = 0; i < 9; i++) {
				const sx = r() * W + Math.sin(p * TAU + r() * 6) * 4;
				const sy = (r() * H + p * H * 1.2) % H;
				x.fillStyle = i % 3 ? '#ff8fc7' : '#ffc2de';
				x.beginPath();
				x.ellipse(sx, sy, 2, 1.2, p * TAU + i, 0, TAU);
				x.fill();
			}

			border(x, '#e36aa0');
		},
	},
];

/**
 * Converts HSL colour values to an RGB triplet.
 *
 * Uses the standard HSL-to-RGB algorithm; hue is automatically normalised into
 * the [0, 360) range so callers can pass accumulated or negative hue values
 * without pre-clamping.
 *
 * @param {number} h - Hue in degrees (any value; wrapped into [0, 360)).
 * @param {number} s - Saturation as a percentage (0–100).
 * @param {number} l - Lightness as a percentage (0–100).
 * @returns {[number, number, number]} An `[r, g, b]` tuple with each component
 *   in the range [0, 255].
 */
function hsl(h, s, l) {
	h = ((h % 360) + 360) % 360;
	s /= 100;
	l /= 100;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const xx = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let r = 0,
		g = 0,
		b = 0;
	if (h < 60) [r, g, b] = [c, xx, 0];
	else if (h < 120) [r, g, b] = [xx, c, 0];
	else if (h < 180) [r, g, b] = [0, c, xx];
	else if (h < 240) [r, g, b] = [0, xx, c];
	else if (h < 300) [r, g, b] = [xx, 0, c];
	else [r, g, b] = [c, 0, xx];
	return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/**
 * Renders all animation frames for a single button spec and encodes them as an
 * animated GIF file. The palette is derived globally from all frames merged
 * together so colours are consistent across the animation.
 *
 * Steps:
 * 1. Calls `spec.draw(ctx, phase, frameIndex)` for each frame.
 * 2. Optionally applies a Bayer dither pass when `spec.dither` is true.
 * 3. Quantises the merged pixel data to `spec.colors` palette entries.
 * 4. Encodes each frame with the shared palette and writes the GIF to disk.
 *
 * @param {ButtonSpec} spec - The button definition to render and encode.
 * @returns {number} The size of the written GIF file in bytes.
 */
function encode(spec) {
	const canvas = createCanvas(W, H);
	const x = canvas.getContext('2d');
	const frameData = [];

	for (let f = 0; f < spec.frames; f++) {
		x.clearRect(0, 0, W, H);
		spec.draw(x, f / spec.frames, f);
		const img = x.getImageData(0, 0, W, H);
		if (spec.dither) dither(img.data);
		frameData.push(new Uint8Array(img.data));
	}

	// one global palette across all frames
	const merged = new Uint8Array(W * H * 4 * frameData.length);
	frameData.forEach((fr, i) => merged.set(fr, i * W * H * 4));
	const palette = quantize(merged, spec.colors ?? 32, {format: 'rgb565'});

	const gif = GIFEncoder();
	frameData.forEach((fr, i) => {
		const index = applyPalette(fr, palette, 'rgb565');
		gif.writeFrame(
			index,
			W,
			H,
			i === 0 ? {palette, delay: spec.delay, repeat: 0} : {delay: spec.delay},
		);
	});
	gif.finish();

	const bytes = gif.bytes();
	writeFileSync(join(OUT, `${spec.id}.gif`), bytes);
	return bytes.length;
}

const manifest = [];
for (const spec of BUTTONS) {
	const size = encode(spec);
	manifest.push({
		id: spec.id,
		file: `/88x31/${spec.id}.gif`,
		alt: spec.alt,
		href: spec.href ?? null,
	});
	console.log(`  ${spec.id}.gif  ${spec.frames}f  ${(size / 1024).toFixed(1)}kb`);
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.length} buttons -> public/88x31/`);
