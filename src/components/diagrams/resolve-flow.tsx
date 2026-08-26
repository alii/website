import {useId} from 'react';
import {
	Arrowhead,
	BOX,
	ERR,
	Figure,
	FONT,
	LABEL,
	MUTED,
	NAME,
	OK,
	SMALL,
	SPINE,
	WAIT,
	type Tone,
} from './shared';

// resolve(value) does exactly one thing, read value.then, and a property read has three
// possible results: missing or not a function, a function, or the getter threw.

const WIDTH = 560;
const HEIGHT = 236;
const TITLE_Y = 18;
const ARROW_TOP = TITLE_Y + 8;
const BOX_Y = 50;
const BOX_H = 44;
const OUT_Y = 172; // arrowheads land here
const TEXT_Y = OUT_Y + 20;

const RESOLVE_X = 280;
const BOX_W = 184;

const OUTCOMES: readonly {x: number; label: string; text: string; sub: string; tone: Tone}[] = [
	{
		x: RESOLVE_X - 150,
		label: 'missing, or not a function',
		text: 'fulfil',
		sub: 'with value',
		tone: OK,
	},
	{x: RESOLVE_X, label: 'getter throws', text: 'reject', sub: 'with the error', tone: ERR},
	{
		x: RESOLVE_X + 150,
		label: 'a function',
		text: 'follow value',
		sub: 'value.then(resolve, reject)',
		tone: WAIT,
	},
];

export function ResolveFlow() {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const marker = (tone: Tone) =>
		tone === OK ? `url(#${id}-ok)` : tone === ERR ? `url(#${id}-err)` : `url(#${id}-wait)`;

	return (
		<Figure
			width={WIDTH}
			height={HEIGHT}
			label="resolve(value) reads value.then: missing or not a function means fulfil with value, the getter throwing means reject with the error, a function means follow value"
		>
			<defs>
				<Arrowhead id={`${id}-ok`} tone={OK} />
				<Arrowhead id={`${id}-err`} tone={ERR} />
				<Arrowhead id={`${id}-wait`} tone={WAIT} />
				<Arrowhead id={`${id}-spine`} tone={MUTED} />
			</defs>

			{/* resolve(value): one question, three answers */}
			<text x={RESOLVE_X} y={TITLE_Y} textAnchor="middle" fontSize={FONT} className={NAME}>
				resolve(value)
			</text>
			<line
				x1={RESOLVE_X}
				y1={ARROW_TOP}
				x2={RESOLVE_X}
				y2={BOX_Y}
				strokeWidth="1.5"
				className={SPINE}
				markerEnd={`url(#${id}-spine)`}
			/>
			<rect
				x={RESOLVE_X - BOX_W / 2}
				y={BOX_Y}
				width={BOX_W}
				height={BOX_H}
				rx="6"
				strokeWidth="1"
				className={BOX}
			/>
			<text
				x={RESOLVE_X}
				y={BOX_Y + BOX_H / 2 + 4}
				textAnchor="middle"
				fontSize={FONT}
				className={NAME}
			>
				read value.then
			</text>

			{OUTCOMES.map(o => {
				const x0 = RESOLVE_X;
				const y0 = BOX_Y + BOX_H;
				const midX = (x0 + o.x) / 2;
				const midY = (y0 + OUT_Y) / 2;
				const side = o.x < x0 ? -1 : o.x > x0 ? 1 : 0;
				return (
					<g key={o.label}>
						<line
							x1={x0}
							y1={y0}
							x2={o.x}
							y2={OUT_Y}
							strokeWidth="1.5"
							className={o.tone.stroke}
							markerEnd={marker(o.tone)}
						/>
						<text
							x={side === 0 ? x0 + 8 : midX + side * 14}
							y={side === 0 ? OUT_Y - 12 : midY - 4}
							textAnchor={side < 0 ? 'end' : 'start'}
							fontSize={SMALL}
							className={LABEL}
						>
							{o.label}
						</text>
						<text x={o.x} y={TEXT_Y} textAnchor="middle" fontSize={FONT} className={o.tone.text}>
							{o.text}
						</text>
						{
							<text x={o.x} y={TEXT_Y + 16} textAnchor="middle" fontSize={SMALL} className={LABEL}>
								{o.sub}
							</text>
						}
					</g>
				);
			})}
		</Figure>
	);
}
