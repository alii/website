import clsx from 'clsx';
import {MacWindow} from './mac-window';

// A static imitation of a macOS Terminal window showing one command and its
// output. `running` leaves the cursor blinking instead of handing the prompt
// back, for programs that never finish. Renders a bare
// window so the post can place one alone or two side by side.

export type TerminalLine = string | {readonly kind: 'cmd' | 'dim'; readonly text: string};

const MONO =
	'font-[Menlo,Monaco,ui-monospace,monospace] text-[12px] leading-[1.55] [font-variant-ligatures:none]';

export function Terminal({
	title,
	lines,
	running = false,
}: {
	readonly title: string;
	readonly lines: readonly TerminalLine[];
	/** The program has not exited: the cursor keeps blinking and the prompt never comes back */
	readonly running?: boolean;
}) {
	return (
		<MacWindow title={title} className="h-full w-full">
			<pre
				className={clsx(
					MONO,
					'm-0 flex-1 overflow-x-auto bg-white px-3.5 py-2.5 whitespace-pre text-[#1d1d1f] dark:bg-[#1e1e1e] dark:text-[#e6e6e6]',
				)}
			>
				{lines.map((line, i) => {
					if (typeof line === 'string') return <div key={i}>{line || ' '}</div>;
					if (line.kind === 'cmd')
						return (
							<div key={i}>
								<span className="text-amber-700 dark:text-amber-300">$ </span>
								<span className="text-yellow-900 dark:text-yellow-100">{line.text}</span>
							</div>
						);
					return (
						<div key={i} className="text-stone-500">
							{line.text}
						</div>
					);
				})}
				{running ? (
					<div>
						<span className="inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse bg-current" />
					</div>
				) : (
					<div>
						<span className="text-amber-700 dark:text-amber-300">$ </span>
						<span className="inline-block h-[14px] w-[7px] translate-y-[2px] bg-current" />
					</div>
				)}
			</pre>
		</MacWindow>
	);
}
