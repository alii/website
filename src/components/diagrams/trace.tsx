import {useId} from 'react';
import {
	Arrowhead,
	Figure,
	FONT,
	LABEL,
	MUTED,
	NAME,
	OK,
	SMALL,
	SPINE,
	WAIT,
	textWidth,
} from './shared';

// A straight line of events for one concrete run: calls and states, top to
// bottom, with the reason for each transition written on the arrow between them.

export interface TraceEvent {
	readonly text: string;
	/** colour for a state; calls are left plain */
	readonly tone?: 'ok' | 'wait';
	/** why the next event happens, on the arrow below this one */
	readonly note?: string;
}

const X = 24;
const STEP = 50; // baseline to baseline
const ARROW_X = X + 10;

export function Trace({events}: {readonly events: readonly TraceEvent[]}) {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const width = Math.max(
		X + Math.max(...events.map(e => textWidth(e.text))) + 6,
		ARROW_X + 12 + Math.max(0, ...events.map(e => textWidth(e.note ?? '') * 0.92)) + 6,
	);
	const height = 14 + (events.length - 1) * STEP + 12;
	const cls = (e: TraceEvent) => (e.tone === 'ok' ? OK.text : e.tone === 'wait' ? WAIT.text : NAME);

	return (
		<Figure
			width={width}
			height={height}
			label={events.map(e => e.text + (e.note ? ` (${e.note})` : '')).join('; ')}
		>
			<defs>
				<Arrowhead id={`${id}-spine`} tone={MUTED} />
			</defs>
			{events.map((e, i) => {
				const y = 18 + i * STEP;
				const last = i === events.length - 1;
				return (
					<g key={i}>
						<text x={X} y={y} fontSize={FONT} className={cls(e)}>
							{e.text}
						</text>
						{!last && (
							<>
								<line
									x1={ARROW_X}
									y1={y + 8}
									x2={ARROW_X}
									y2={y + STEP - 14}
									strokeWidth="1.5"
									className={SPINE}
									markerEnd={`url(#${id}-spine)`}
								/>
								{e.note && (
									<text x={ARROW_X + 12} y={y + STEP / 2 + 1} fontSize={SMALL} className={LABEL}>
										{e.note}
									</text>
								)}
							</>
						)}
					</g>
				);
			})}
		</Figure>
	);
}
