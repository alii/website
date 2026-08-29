import clsx from 'clsx';
import type {ReactNode} from 'react';
import {MacWindow} from './mac-window';

// A static imitation of Safari's Web Inspector console: one evaluated input
// and the rows it produced. Not interactive. Colours follow Safari's own
// light and dark inspector themes.

export type ConsoleRow =
	| {readonly kind: 'error'; readonly children: ReactNode}
	| {readonly kind: 'log'; readonly children: ReactNode}
	| {readonly kind: 'result'; readonly children: ReactNode};

const MONO =
	'font-[Menlo,Monaco,ui-monospace,monospace] text-[12px] leading-[1.5] [font-variant-ligatures:none]';
const RULE = 'border-[#e4e4e4] dark:border-[#3c3c3c]';

/** A string value, the way the inspector prints one */
export function Str({children}: {readonly children: ReactNode}) {
	return <span className="text-[#c41a16] dark:text-[#ff8170]">{children}</span>;
}

/** An object preview: `{key: value}` in italic grey */
export function Obj({children}: {readonly children: ReactNode}) {
	return <span className="text-[#6b6b6b] italic dark:text-[#a8a8a8]">{children}</span>;
}

/** De-emphasised trailing text such as `= $1` */
export function Dim({children}: {readonly children: ReactNode}) {
	return <span className="text-[#8a8a8a] dark:text-[#8f8f8f]">{children}</span>;
}

function Chevron({dir, className}: {readonly dir: 'left' | 'right'; readonly className?: string}) {
	return (
		<svg viewBox="0 0 12 12" className={clsx('mt-[3px] size-3 shrink-0', className)} aria-hidden>
			<path
				d={dir === 'right' ? 'M4 2 L8.5 6 L4 10' : 'M8 2 L3.5 6 L8 10'}
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function Triangle() {
	return (
		<svg
			viewBox="0 0 12 12"
			className="mt-[3px] size-3 shrink-0 fill-[#7a7a7a] dark:fill-[#9a9a9a]"
			aria-hidden
		>
			<path d="M3 1.5 L10 6 L3 10.5 Z" />
		</svg>
	);
}

function ErrorIcon() {
	return (
		<svg viewBox="0 0 12 12" className="mt-[3px] size-3 shrink-0" aria-hidden>
			<circle cx="6" cy="6" r="6" className="fill-[#e0241b] dark:fill-[#ff453a]" />
			<path d="M6 2.6 V7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
			<circle cx="6" cy="9.2" r="1" fill="white" />
		</svg>
	);
}

function LogIcon() {
	return (
		<svg
			viewBox="0 0 12 12"
			className="mt-[3px] size-3 shrink-0 stroke-[#7a7a7a] dark:stroke-[#9a9a9a]"
			fill="none"
			strokeWidth="1.5"
			strokeLinecap="round"
			aria-hidden
		>
			<path d="M2 3 H10 M2 6 H10 M2 9 H7" />
		</svg>
	);
}

export function SafariConsole({
	code,
	rows,
	title = 'Safari',
}: {
	/** The input as it was typed; echoed in Safari's uniform input blue */
	readonly code: string;
	/** What the inspector printed, in order */
	readonly rows: readonly ConsoleRow[];
	/** Window title, shown after the traffic lights */
	readonly title?: string;
}) {
	return (
		<figure className="not-prose my-8">
			<MacWindow title={title}>
				<div className={clsx(MONO, 'text-[#1d1d1f] dark:text-[#e6e6e6]')}>
					<div className={clsx('flex items-start gap-2 border-b px-3 py-2', RULE)}>
						<Chevron dir="right" className="text-[#7a7a7a] dark:text-[#9a9a9a]" />
						<pre
							className={clsx(
								MONO,
								'm-0 overflow-x-auto whitespace-pre text-[#2a59c7] dark:text-[#7aa2ff]',
							)}
						>
							{code}
						</pre>
					</div>

					{rows.map((row, i) => {
						switch (row.kind) {
							case 'error':
								return (
									<div
										key={i}
										className={clsx(
											'flex items-start gap-2 border-b bg-[#fdf1f1] px-3 py-1.5 text-[#c0251c] dark:bg-[#3a2626] dark:text-[#ff7b72]',
											RULE,
										)}
									>
										<ErrorIcon />
										<Triangle />
										<span>{row.children}</span>
									</div>
								);
							case 'log':
								return (
									<div
										key={i}
										className={clsx('flex items-start gap-2 border-b px-3 py-1.5', RULE)}
									>
										<LogIcon />
										<span>{row.children}</span>
									</div>
								);
							case 'result':
								return (
									<div
										key={i}
										className={clsx('flex items-start gap-2 border-b px-3 py-1.5', RULE)}
									>
										<Chevron dir="left" className="text-[#9a9a9a] dark:text-[#7a7a7a]" />
										<Triangle />
										<span>{row.children}</span>
									</div>
								);
						}
					})}

					<div className="flex h-8 items-center gap-2 px-3">
						<Chevron dir="right" className="mt-0 text-[#2a7fff] dark:text-[#5aa2ff]" />
						<span className="-ml-1 inline-block h-[14px] w-px bg-[#1d1d1f] dark:bg-[#e6e6e6]" />
					</div>
				</div>
			</MacWindow>
		</figure>
	);
}
