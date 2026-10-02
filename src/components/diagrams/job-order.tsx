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
	SMALL,
	switchPath,
	TEXT,
	textWidth,
} from './shared';

// NewPromiseResolveThenableJob, twice: the order the spec gives, and the order
// JavaScriptCore's fast path used before the fix. Same two boxes, swapped. In
// the spec lane the throw lands on the failure track. In the JSC lane the
// failure track hasn't been built yet, so the throw lands nowhere.

const LANE_H = 132;
const TOP = 44;
const BOT = 92;
const BOX_TOP = 26;
const BOX_H = 84;
const GAP = 30;
const SWITCH_INSET = 14;
const TRAIN_SPEED = 70;

const LANES = [
	{label: 'spec', steps: ['create resolve/reject', 'call x.then'], throwsAt: 1},
	{label: 'JSC, before', steps: ['look up species', 'create resolve/reject'], throwsAt: 0},
] as const;

const labelW = Math.max(...LANES.map(l => textWidth(l.label))) + 10;
const trackStart = PAD_X + labelW;
const colW: readonly [number, number] = [
	Math.max(...LANES.map(l => textWidth(l.steps[0]) + 28)),
	Math.max(...LANES.map(l => textWidth(l.steps[1]) + 28)),
];
const boxX: readonly [number, number] = [trackStart + GAP, trackStart + GAP + colW[0] + GAP];
const trackEnd = boxX[1] + colW[1] + GAP;
const labelX = trackEnd + 8;
const WIDTH = labelX + textWidth('rejected') + PAD_X;
const HEIGHT = LANE_H * 2;

function route(oy: number, at: 0 | 1) {
	const x1 = boxX[at] + SWITCH_INSET;
	const x2 = boxX[at] + colW[at] - SWITCH_INSET;
	const before = x1 - trackStart;
	const curve = Math.hypot(x2 - x1, BOT - TOP);
	const total = before + curve + (trackEnd - x2);
	return {
		d: `M ${trackStart},${oy + TOP} H ${x1} ${switchPath(x1, oy + TOP, x2, oy + BOT).slice(`M ${x1},${oy + TOP} `.length)} H ${trackEnd}`,
		enterCurve: before / total,
		leaveCurve: (before + curve) / total,
		total,
	};
}

export function JobOrder() {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const rides = LANES.map((lane, i) => route(i * LANE_H, lane.throwsAt));
	const duration = Math.max(...rides.map(r => r.total)) / TRAIN_SPEED;

	return (
		<Figure
			width={WIDTH}
			height={HEIGHT}
			label="The thenable job in spec order versus JavaScriptCore's order before the fix"
		>
			<defs>
				<Arrowhead id={`${id}-ok`} tone={OK} />
				<Arrowhead id={`${id}-err`} tone={ERR} />
				<Arrowhead id={`${id}-muted`} tone={MUTED} />
				<linearGradient
					id={`${id}-fade`}
					gradientUnits="userSpaceOnUse"
					x1={boxX[0]}
					y1="0"
					x2={boxX[0] + colW[0]}
					y2="0"
				>
					<stop offset="0" stopColor="currentColor" className={ERR.color} />
					<stop offset="1" stopColor="currentColor" stopOpacity="0" className={ERR.color} />
				</linearGradient>
				{rides.map((r, i) => (
					<path key={i} id={`${id}-route-${i}`} d={r.d} fill="none" />
				))}
			</defs>

			{LANES.map((lane, i) => {
				const oy = i * LANE_H;
				const top = oy + TOP;
				const bot = oy + BOT;
				const isSpec = i === 0;
				const t = lane.throwsAt;
				const sx1 = boxX[t] + SWITCH_INSET;
				const sx2 = boxX[t] + colW[t] - SWITCH_INSET;

				return (
					<g key={lane.label}>
						<text x={PAD_X} y={top + 4} fontSize={FONT} className={TEXT}>
							{lane.label}
						</text>

						{([0, 1] as const).map(j => (
							<NamedBox
								key={j}
								x={boxX[j]}
								y={oy + BOX_TOP}
								w={colW[j]}
								h={BOX_H}
								name={lane.steps[j]}
								dashed={!isSpec && j === 1}
							/>
						))}

						{/* success track up to the switch, then either onward (spec) or never reached (JSC) */}
						<line
							x1={trackStart}
							y1={top}
							x2={boxX[0]}
							y2={top}
							strokeWidth="1.5"
							className={OK.stroke}
							markerEnd={`url(#${id}-ok)`}
						/>
						{isSpec ? (
							<>
								<line
									x1={boxX[0]}
									y1={top}
									x2={boxX[1]}
									y2={top}
									strokeWidth="1.5"
									className={OK.stroke}
									markerEnd={`url(#${id}-ok)`}
								/>
								<line
									x1={boxX[1]}
									y1={top}
									x2={trackEnd}
									y2={top}
									strokeWidth="1.5"
									className={OK.stroke}
									markerEnd={`url(#${id}-ok)`}
								/>
								<text x={labelX} y={top + 4} fontSize={FONT} className={TEXT}>
									fulfilled
								</text>
							</>
						) : (
							<>
								<line
									x1={boxX[0]}
									y1={top}
									x2={sx1}
									y2={top}
									strokeWidth="1.5"
									className={OK.stroke}
								/>
								<line
									x1={sx1}
									y1={top}
									x2={trackEnd}
									y2={top}
									strokeWidth="1.5"
									strokeDasharray="3 4"
									className={MUTED.stroke}
									markerEnd={`url(#${id}-muted)`}
								/>
								<text x={labelX} y={top + 4} fontSize={FONT} className={MUTED.text}>
									fulfilled
								</text>
							</>
						)}

						{/* the throw */}
						<text x={sx2 + 6} y={(top + bot) / 2 + 4} fontSize={SMALL} className={ERR.text}>
							{isSpec ? 'throws' : 'throws, uncaught'}
						</text>
						{isSpec ? (
							<>
								<path
									d={switchPath(sx1, top, sx2, bot)}
									fill="none"
									strokeWidth="1.5"
									className={ERR.stroke}
								/>
								<line
									x1={sx2}
									y1={bot}
									x2={trackEnd}
									y2={bot}
									strokeWidth="1.5"
									className={ERR.stroke}
									markerEnd={`url(#${id}-err)`}
								/>
								<text x={labelX} y={bot + 4} fontSize={FONT} className={TEXT}>
									rejected
								</text>
							</>
						) : (
							<>
								<path
									d={switchPath(sx1, top, sx2, bot)}
									fill="none"
									strokeWidth="1.5"
									stroke={`url(#${id}-fade)`}
								/>
								<text x={labelX} y={bot + 4} fontSize={FONT} className={MUTED.text}>
									rejected
								</text>
								<text
									x={WIDTH - PAD_X}
									y={oy + LANE_H - 10}
									textAnchor="end"
									fontSize={SMALL}
									className="fill-orange-800 font-mono italic dark:fill-orange-300"
								>
									neither. pending forever.
								</text>
							</>
						)}
					</g>
				);
			})}

			{/* trains, in step */}
			<g className="motion-reduce:hidden">
				{rides.map((r, i) => {
					const isSpec = i === 0;
					const mid = (r.enterCurve + r.leaveCurve) / 2;
					return (
						<g key={i}>
							<circle r="4" className={OK.fill}>
								<animateMotion dur={`${duration}s`} repeatCount="indefinite">
									<mpath href={`#${id}-route-${i}`} />
								</animateMotion>
								<animate
									attributeName="opacity"
									values={isSpec ? '1;1;0;0' : '1;1;0;0'}
									keyTimes={
										isSpec
											? `0;${mid - 0.02};${mid + 0.02};1`
											: `0;${r.enterCurve};${r.leaveCurve};1`
									}
									dur={`${duration}s`}
									repeatCount="indefinite"
								/>
							</circle>
							{isSpec && (
								<circle r="4" className={ERR.fill}>
									<animateMotion dur={`${duration}s`} repeatCount="indefinite">
										<mpath href={`#${id}-route-${i}`} />
									</animateMotion>
									<animate
										attributeName="opacity"
										values="0;0;1;1"
										keyTimes={`0;${mid - 0.02};${mid + 0.02};1`}
										dur={`${duration}s`}
										repeatCount="indefinite"
									/>
								</circle>
							)}
						</g>
					);
				})}
			</g>
		</Figure>
	);
}
