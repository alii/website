import {useEffect, useRef} from 'react';

type Point = [number, number];
type Path = Point[];

const COUNT = 44;

// Each glyph is a set of strokes inside a -1..1 box. Dots are spread evenly along them.
const glyphs: {name: string; paths: Path[]}[] = [
	{
		name: 'A',
		paths: [
			[
				[-0.7, 0.95],
				[0, -0.95],
				[0.7, 0.95],
			],
			[
				[-0.38, 0.25],
				[0.38, 0.25],
			],
		],
	},
	{
		name: 'lambda',
		paths: [
			[
				[-0.75, -0.95],
				[-0.4, -0.95],
				[0.65, 0.95],
			],
			[
				[0.05, 0],
				[-0.6, 0.95],
			],
		],
	},
	{
		name: 'code',
		paths: [
			[
				[-0.4, -0.6],
				[-0.95, 0],
				[-0.4, 0.6],
			],
			[
				[0.4, -0.6],
				[0.95, 0],
				[0.4, 0.6],
			],
			[
				[0.18, -0.85],
				[-0.18, 0.85],
			],
		],
	},
	{
		name: 'cube',
		paths: [
			[
				[0, -0.95],
				[0.82, -0.48],
				[0.82, 0.48],
				[0, 0.95],
				[-0.82, 0.48],
				[-0.82, -0.48],
				[0, -0.95],
			],
			[
				[-0.82, -0.48],
				[0, 0],
				[0.82, -0.48],
			],
			[
				[0, 0],
				[0, 0.95],
			],
		],
	},
];

function sample(paths: Path[], count: number): Point[] {
	const segments: [Point, Point, number][] = [];
	for (const path of paths) {
		for (let i = 1; i < path.length; i++) {
			const a = path[i - 1]!;
			const b = path[i]!;
			segments.push([a, b, Math.hypot(b[0] - a[0], b[1] - a[1])]);
		}
	}

	const total = segments.reduce((sum, s) => sum + s[2], 0);
	const out: Point[] = [];

	for (let i = 0; i < count; i++) {
		let d = ((i + 0.5) / count) * total;
		for (const [a, b, length] of segments) {
			if (d <= length) {
				const t = d / length;
				out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
				break;
			}
			d -= length;
		}
	}

	return out;
}

const RADIUS = 0.07;

// Line every glyph up on the left edge, so it sits flush with the text below
const targets = glyphs.map(g => {
	const points = sample(g.paths, COUNT);
	const left = Math.min(...points.map(p => p[0]));
	return points.map(([x, y]) => [x - left + RADIUS, y] as Point);
});

export function Glyph() {
	const dots = useRef<(SVGCircleElement | null)[]>([]);
	const hovering = useRef<number | null>(null);
	const next = useRef(() => {});

	useEffect(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let frame = 0;

		const s = {
			index: 0,
			changedAt: -Infinity,
			points: targets[0]!.map(([x, y]) => ({x, y, vx: 0, vy: 0, glow: 0})),
		};

		next.current = () => {
			const now = performance.now();
			s.index = (s.index + 1) % targets.length;
			s.changedAt = now;
			// Trace the new shape once it has landed
			if (hovering.current !== null) hovering.current = now + 450;

			const cx = s.points.reduce((sum, p) => sum + p.x, 0) / s.points.length;
			const cy = s.points.reduce((sum, p) => sum + p.y, 0) / s.points.length;
			for (const p of s.points) {
				p.vx += (p.x - cx) * 0.06;
				p.vy += (p.y - cy) * 0.06;
			}
		};

		const tick = (now: number) => {
			const target = targets[s.index]!;

			// While hovered, a highlight runs along the strokes in drawing order,
			// like an interpreter stepping through a program
			const since = hovering.current === null ? null : now - hovering.current;
			const head = since === null || since < 0 ? null : (since / 22) % (COUNT + 24);

			s.points.forEach((p, i) => {
				const started = now - s.changedAt > i * 9;
				const [tx, ty] = started ? target[i]! : [p.x, p.y];

				const wobble = reduce ? 0 : 0.02;
				const gx = tx + Math.sin(now / 900 + i * 0.7) * wobble;
				const gy = ty + Math.cos(now / 1100 + i * 0.9) * wobble;

				p.vx += (gx - p.x) * 0.09;
				p.vy += (gy - p.y) * 0.09;

				p.vx *= 0.76;
				p.vy *= 0.76;
				p.x += p.vx;
				p.y += p.vy;

				const behind = head === null ? -1 : head - i;
				const want = behind >= 0 && behind < 12 ? Math.exp(-behind / 3) : 0;
				p.glow = want > p.glow ? want : p.glow + (want - p.glow) * 0.08;

				const dot = dots.current[i];
				if (dot) {
					dot.setAttribute('cx', p.x.toFixed(3));
					dot.setAttribute('cy', (p.y - p.glow * 0.06).toFixed(3));
					dot.setAttribute('r', (RADIUS * (1 + p.glow * 0.6)).toFixed(3));
					dot.style.setProperty('--glow', `${Math.round(p.glow * 100)}%`);
				}
			});

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<button
			type="button"
			aria-label="Change the shape"
			className="mb-6 block cursor-pointer rounded-sm text-stone-400 outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 dark:text-stone-500"
			onClick={() => next.current()}
			onPointerEnter={() => (hovering.current = performance.now())}
			onPointerLeave={() => (hovering.current = null)}
		>
			<svg viewBox="0 -1.3 2.6 2.6" className="size-12 overflow-visible">
				{targets[0]!.map(([x, y], i) => (
					<circle
						key={i}
						ref={el => void (dots.current[i] = el)}
						cx={x}
						cy={y}
						r={RADIUS}
						style={{
							fill: 'color-mix(in oklab, var(--color-orange-500) var(--glow, 0%), currentColor)',
						}}
					/>
				))}
			</svg>
		</button>
	);
}
