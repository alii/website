import {useId} from 'react';
import {Arrowhead, ERR, Figure, FONT, MUTED, OK, PAD_X, SMALL, TEXT, textWidth} from './shared';

// Promise(Result(a, e)): a one-track promise carrying a two-track value. The
// Result rides the fulfil track; the reject track is still there, still
// untyped, and reserved for disasters.

const TOP = 40;
const BOT = 92;
const HEIGHT = 118;
const CAP_H = 30;
const TRACK_LEN = 420;
const OK_LABEL = 'Ok(b)';
const ERR_LABEL = 'Error(e)';

export function Carried() {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');

	const trackStart = PAD_X + textWidth('fulfilled') + 10;
	const trackEnd = trackStart + TRACK_LEN;
	const halfOk = textWidth(OK_LABEL) + 24;
	const halfErr = textWidth(ERR_LABEL) + 24;
	const capW = halfOk + halfErr;
	const capX = trackStart + (TRACK_LEN - capW) / 2;
	const labelX = trackEnd + 8;
	const width = labelX + textWidth('Result(b, e)') + PAD_X;
	const r = CAP_H / 2;

	return (
		<Figure
			width={width}
			height={HEIGHT}
			label="A promise whose fulfil track carries a Result with Ok and Error; its reject track is untyped and unused"
		>
			<defs>
				<Arrowhead id={`${id}-ok`} tone={OK} />
				<Arrowhead id={`${id}-muted`} tone={MUTED} />
			</defs>

			{/* fulfil track, broken around the cargo */}
			<text x={PAD_X} y={TOP + 4} fontSize={FONT} className={TEXT}>
				fulfilled
			</text>
			<line x1={trackStart} y1={TOP} x2={capX} y2={TOP} strokeWidth="1.5" className={OK.stroke} />
			<line
				x1={capX + capW}
				y1={TOP}
				x2={trackEnd}
				y2={TOP}
				strokeWidth="1.5"
				className={OK.stroke}
				markerEnd={`url(#${id}-ok)`}
			/>
			<text x={labelX} y={TOP + 4} fontSize={FONT} className={TEXT}>
				Result(b, e)
			</text>

			{/* the cargo: one capsule, two halves */}
			<path
				d={`M ${capX + r},${TOP - r} H ${capX + halfOk} V ${TOP + r} H ${capX + r} A ${r} ${r} 0 0 1 ${capX + r},${TOP - r} Z`}
				strokeWidth="1.2"
				className={`${OK.stroke} ${OK.wash}`}
			/>
			<path
				d={`M ${capX + halfOk},${TOP - r} H ${capX + capW - r} A ${r} ${r} 0 0 1 ${capX + capW - r},${TOP + r} H ${capX + halfOk} Z`}
				strokeWidth="1.2"
				className={`${ERR.stroke} ${ERR.wash}`}
			/>
			<text
				x={capX + halfOk / 2}
				y={TOP + 4}
				textAnchor="middle"
				fontSize={FONT}
				className={OK.text}
			>
				{OK_LABEL}
			</text>
			<text
				x={capX + halfOk + halfErr / 2}
				y={TOP + 4}
				textAnchor="middle"
				fontSize={FONT}
				className={ERR.text}
			>
				{ERR_LABEL}
			</text>

			{/* reject track, untyped and idle */}
			<text x={PAD_X} y={BOT + 4} fontSize={FONT} className={TEXT}>
				rejected
			</text>
			<line
				x1={trackStart}
				y1={BOT}
				x2={trackEnd}
				y2={BOT}
				strokeWidth="1.5"
				strokeDasharray="3 4"
				className={MUTED.stroke}
				markerEnd={`url(#${id}-muted)`}
			/>
			<text
				x={labelX}
				y={BOT + 4}
				fontSize={FONT}
				className="fill-stone-500 font-mono italic dark:fill-stone-500"
			>
				any
			</text>
			<text
				x={trackStart + TRACK_LEN / 2}
				y={BOT + 18}
				textAnchor="middle"
				fontSize={SMALL}
				className={MUTED.text}
			>
				only ever disasters we don't know about
			</text>
		</Figure>
	);
}
