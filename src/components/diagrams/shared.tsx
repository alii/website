import type {ReactNode} from 'react';

// Shared bits for the in-post SVG diagrams. Everything is pure SVG with
// Tailwind classes on the elements, so it renders at build time, scales with
// the column, and follows the site theme via `dark:` variants.

export const FONT = 12.5;
export const SMALL = 11.5;
export const CH = 7.6; // approx advance of one Iosevka char at FONT px
export const PAD_X = 6;

export const textWidth = (s: string) => s.length * CH;

export const OK = {
	stroke: 'stroke-[#6d7030] dark:stroke-[#b3bd6d]',
	fill: 'fill-[#6d7030] dark:fill-[#b3bd6d]',
	text: 'font-mono fill-[#6d7030] dark:fill-[#b3bd6d]',
	color: 'text-[#6d7030] dark:text-[#b3bd6d]',
	wash: 'fill-[#6d7030]/12 dark:fill-[#b3bd6d]/12',
};

export const ERR = {
	stroke: 'stroke-orange-800 dark:stroke-orange-300',
	fill: 'fill-orange-800 dark:fill-orange-300',
	text: 'font-mono fill-orange-800 dark:fill-orange-300',
	color: 'text-orange-800 dark:text-orange-300',
	wash: 'fill-orange-800/12 dark:fill-orange-300/12',
};

export const WAIT = {
	stroke: 'stroke-amber-700 dark:stroke-amber-300',
	fill: 'fill-amber-700 dark:fill-amber-300',
	text: 'font-mono fill-amber-700 dark:fill-amber-300',
	color: 'text-amber-700 dark:text-amber-300',
	wash: 'fill-amber-700/12 dark:fill-amber-300/12',
};

export const MUTED = {
	stroke: 'stroke-stone-400 dark:stroke-stone-600',
	fill: 'fill-stone-400 dark:fill-stone-500',
	text: 'font-mono fill-stone-500 dark:fill-stone-500',
	color: 'text-stone-400 dark:text-stone-600',
	wash: 'fill-stone-400/12 dark:fill-stone-600/12',
};

export type Tone = typeof OK;

export const TEXT = 'font-mono fill-stone-600 dark:fill-stone-400';
export const NAME = 'font-mono fill-stone-700 dark:fill-stone-300';
export const BOX = 'fill-[#fdfcf9] stroke-stone-300 dark:fill-[#1c1917] dark:stroke-stone-700';
export const SPINE = 'stroke-stone-400 dark:stroke-stone-500';
/** secondary labels on arrows: readable, but clearly not the main text */
export const LABEL = 'font-mono fill-stone-500 dark:fill-stone-400';

export function Arrowhead({id, tone}: {readonly id: string; readonly tone: Tone}) {
	// the tip overshoots the line end by 1px so the line's flat end is hidden under it
	return (
		<marker
			id={id}
			markerWidth="8"
			markerHeight="7"
			refX="7"
			refY="3.5"
			orient="auto"
			markerUnits="userSpaceOnUse"
		>
			<path d="M0,0.5 L8,3.5 L0,6.5 z" className={tone.fill} />
		</marker>
	);
}

export function Figure({
	width,
	height,
	label,
	children,
}: {
	readonly width: number;
	readonly height: number;
	readonly label: string;
	readonly children: ReactNode;
}) {
	return (
		<figure className="not-prose my-6 overflow-x-auto">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="mx-auto h-auto w-full"
				style={{maxWidth: width}}
				role="img"
				aria-label={label}
			>
				{children}
			</svg>
		</figure>
	);
}

/** A rounded box with its name sitting just above it */
export function NamedBox({
	x,
	y,
	w,
	h,
	name,
	dashed,
}: {
	readonly x: number;
	readonly y: number;
	readonly w: number;
	readonly h: number;
	readonly name: string;
	readonly dashed?: boolean;
}) {
	return (
		<g>
			<rect
				x={x}
				y={y}
				width={w}
				height={h}
				rx="6"
				strokeWidth="1"
				strokeDasharray={dashed ? '3 4' : undefined}
				className={BOX}
			/>
			<text
				x={x + w / 2}
				y={y - 11}
				textAnchor="middle"
				fontSize={FONT}
				className={dashed ? MUTED.text : NAME}
			>
				{name}
			</text>
		</g>
	);
}

/** S-curve from one track height to another, inside a box */
export function switchPath(x1: number, y1: number, x2: number, y2: number) {
	const d = (x2 - x1) / 2;
	return `M ${x1},${y1} C ${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`;
}
