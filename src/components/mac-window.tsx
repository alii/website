import clsx from 'clsx';
import type {ReactNode} from 'react';
import lightsDark from './traffic-lights-dark.png';
import lightsLight from './traffic-lights-light.png';

// A macOS 27 style window: traffic lights, a title, a hairline border, no shadow.
// Used by the fake Safari console and the fake Terminal in posts.

const SYSTEM = "font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif]";
const RULE = 'border-[#e4e4e4] dark:border-[#3c3c3c]';

// The traffic lights are the real thing: macOS 27's standard window buttons,
// rendered by AppKit at 4x with a transparent background (tmp/traffic-lights.swift),
// once per appearance. 66x20pt box: three 14pt buttons (12pt discs) 9pt apart.
export function TrafficLights() {
	return (
		<>
			<img
				src={lightsLight.src}
				alt=""
				draggable={false}
				className="h-4 w-auto shrink-0 select-none dark:hidden"
			/>
			<img
				src={lightsDark.src}
				alt=""
				draggable={false}
				className="hidden h-4 w-auto shrink-0 select-none dark:block"
			/>
		</>
	);
}

export function MacWindow({
	title,
	right,
	className,
	children,
}: {
	readonly title: string;
	/** Optional text at the right of the title bar */
	readonly right?: string;
	readonly className?: string;
	readonly children: ReactNode;
}) {
	return (
		<div
			className={clsx(
				'mx-auto flex flex-col overflow-hidden rounded-lg bg-white dark:bg-[#262626]',
				'ring-1 ring-black/10 dark:ring-white/10',
				className,
			)}
		>
			<div
				className={clsx(
					SYSTEM,
					'flex h-6 items-center gap-1.5 border-b bg-[#f3f3f3] px-2 text-[12px] text-[#6b6b6b] dark:bg-[#2e2e2e] dark:text-[#a9a9a9]',
					RULE,
				)}
			>
				<TrafficLights />
				<span className="text-[12px] font-semibold text-[#3a3a3a] dark:text-[#e0e0e0]">
					{title}
				</span>
				{right && <span className="ml-auto">{right}</span>}
			</div>
			{children}
		</div>
	);
}
