import clsx from 'clsx';
import {useId} from 'react';
import {
	Arrowhead,
	ERR,
	Figure,
	FONT,
	MUTED,
	NamedBox,
	OK,
	PAD_X,
	switchPath,
	TEXT,
	textWidth,
} from './shared';

// A two-track railway in the style of Scott Wlaschin's Railway Oriented
// Programming. Each step is a box the success track runs through, with a
// switch that can divert onto the failure track below.

const TOP = 44; // success track y
const BOT = 92; // failure track y
const BOX_TOP = 26;
const BOX_BOTTOM = 110;
const HEIGHT = 122;
const GAP = 30; // track between boxes
const SWITCH_INSET = 14; // how far inside the box the switch starts/ends
const TRAIN_SPEED = 70; // px per second

interface Box {
	readonly name: string;
	readonly x: number;
	readonly w: number;
}

interface Layout {
	readonly inputX: number;
	readonly trackStart: number;
	readonly boxes: readonly Box[];
	readonly trackEnd: number;
	readonly labelX: number;
	readonly width: number;
}

function layout(input: string, steps: readonly string[], success: string, failure: string): Layout {
	let x = PAD_X;
	const inputX = x;
	x += textWidth(input) + 8;
	const trackStart = x;
	x += GAP;

	const boxes: Box[] = [];
	for (const name of steps) {
		const w = Math.max(88, textWidth(name) + 28);
		boxes.push({name, x, w});
		x += w + GAP;
	}

	const trackEnd = x; // both tracks end here, arrowheads included
	const labelX = trackEnd + 8;
	const width = labelX + Math.max(textWidth(success), textWidth(failure)) + PAD_X;

	return {inputX, trackStart, boxes, trackEnd, labelX, width};
}

interface Ride {
	readonly route: string;
	/** fraction of the route where the train changes track (1 = never) */
	readonly switchAt: number;
	readonly duration: number;
}

function trainRoute(trackStart: number, trackEnd: number, derail: Box | undefined): Ride {
	if (!derail) {
		return {
			route: `M ${trackStart},${TOP} H ${trackEnd}`,
			switchAt: 1,
			duration: (trackEnd - trackStart) / TRAIN_SPEED,
		};
	}

	const x1 = derail.x + SWITCH_INSET;
	const x2 = derail.x + derail.w - SWITCH_INSET;
	const before = x1 - trackStart;
	const curve = Math.hypot(x2 - x1, BOT - TOP);
	const after = trackEnd - x2;
	const total = before + curve + after;

	return {
		route: `M ${trackStart},${TOP} H ${x1} ${switchPath(x1, TOP, x2, BOT).slice(`M ${x1},${TOP} `.length)} H ${trackEnd}`,
		switchAt: (before + curve / 2) / total,
		duration: total / TRAIN_SPEED,
	};
}

export interface RailwayProps {
	/** Label at the left of the success track */
	readonly input: string;
	/** One box per step, in order */
	readonly steps: readonly string[];
	/** Label at the right end of the success track */
	readonly success: string;
	/** Label at the right end of the failure track */
	readonly failure: string;
	/** Draw the failure track dashed and its label muted — a track with no type on it */
	readonly untypedFailure?: boolean;
	/**
	 * Animate a train. `'success'` rides the top track all the way; a number is
	 * the index of the step whose switch sends it onto the failure track.
	 */
	readonly train?: 'success' | number;
}

export function Railway({input, steps, success, failure, untypedFailure, train}: RailwayProps) {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const okMarker = `url(#${id}-ok)`;
	const errMarker = `url(#${id}-err)`;

	const {inputX, trackStart, boxes, trackEnd, labelX, width} = layout(
		input,
		steps,
		success,
		failure,
	);
	const derail = typeof train === 'number' ? boxes[train] : undefined;
	const ride = train === undefined ? undefined : trainRoute(trackStart, trackEnd, derail);

	const fail = untypedFailure ? MUTED : ERR;
	const failDash = untypedFailure ? '3 4' : undefined;

	return (
		<Figure
			width={width}
			height={HEIGHT}
			label={`Railway diagram: ${input} through ${steps.join(', ')} to ${success} or ${failure}`}
		>
			<defs>
				<Arrowhead id={`${id}-ok`} tone={OK} />
				<Arrowhead id={`${id}-err`} tone={fail} />
				{ride && <path id={`${id}-route`} d={ride.route} fill="none" />}
			</defs>

			{boxes.map(box => (
				<NamedBox
					key={box.x}
					x={box.x}
					y={BOX_TOP}
					w={box.w}
					h={BOX_BOTTOM - BOX_TOP}
					name={box.name}
				/>
			))}

			<text x={inputX} y={TOP + 4} fontSize={FONT} className={TEXT}>
				{input}
			</text>

			{/* success track: one continuous line, arrowheads drawn as short overlays */}
			<line
				x1={trackStart}
				y1={TOP}
				x2={trackEnd}
				y2={TOP}
				strokeWidth="1.5"
				className={OK.stroke}
				markerEnd={okMarker}
			/>
			{boxes.map(box => (
				<line
					key={box.x}
					x1={box.x - GAP}
					y1={TOP}
					x2={box.x}
					y2={TOP}
					strokeWidth="1.5"
					className={OK.stroke}
					markerEnd={okMarker}
				/>
			))}

			{/* failure track: starts at the first switch, passes through later boxes */}
			{boxes.map((box, i) => {
				const x1 = box.x + SWITCH_INSET;
				const x2 = box.x + box.w - SWITCH_INSET;
				const isLast = i === boxes.length - 1;
				const next = boxes[i + 1];

				return (
					<g key={box.x}>
						<path
							d={switchPath(x1, TOP, x2, BOT)}
							fill="none"
							strokeWidth="1.5"
							strokeDasharray={failDash}
							className={fail.stroke}
						/>
						{i > 0 && (
							<line
								x1={box.x}
								y1={BOT}
								x2={box.x + box.w}
								y2={BOT}
								strokeWidth="1.5"
								strokeDasharray={failDash}
								className={fail.stroke}
							/>
						)}
						<line
							x1={x2}
							y1={BOT}
							x2={isLast ? trackEnd : next!.x}
							y2={BOT}
							strokeWidth="1.5"
							strokeDasharray={failDash}
							className={fail.stroke}
							markerEnd={errMarker}
						/>
					</g>
				);
			})}

			<text x={labelX} y={TOP + 4} fontSize={FONT} className={TEXT}>
				{success}
			</text>
			<text
				x={labelX}
				y={BOT + 4}
				fontSize={FONT}
				className={clsx(TEXT, untypedFailure && 'fill-stone-500 italic dark:fill-stone-500')}
			>
				{failure}
			</text>

			{/* the train: two dots on the same route, fading between them at the switch */}
			{ride && (
				<g className="motion-reduce:hidden">
					<circle r="4" className={OK.fill}>
						<animateMotion dur={`${ride.duration}s`} repeatCount="indefinite">
							<mpath href={`#${id}-route`} />
						</animateMotion>
						{derail && (
							<animate
								attributeName="opacity"
								values="1;1;0;0"
								keyTimes={`0;${ride.switchAt - 0.02};${ride.switchAt + 0.02};1`}
								dur={`${ride.duration}s`}
								repeatCount="indefinite"
							/>
						)}
					</circle>
					{derail && (
						<circle r="4" className={fail.fill}>
							<animateMotion dur={`${ride.duration}s`} repeatCount="indefinite">
								<mpath href={`#${id}-route`} />
							</animateMotion>
							<animate
								attributeName="opacity"
								values="0;0;1;1"
								keyTimes={`0;${ride.switchAt - 0.02};${ride.switchAt + 0.02};1`}
								dur={`${ride.duration}s`}
								repeatCount="indefinite"
							/>
						</circle>
					)}
				</g>
			)}
		</Figure>
	);
}
