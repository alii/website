import {useLocalStorage} from 'alistair/hooks';
import {AnimatePresence, motion} from 'framer-motion';
import {useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {TbLock, TbLockOpen} from 'react-icons/tb';
import {useIsomorphicValue} from '../hooks/use-isomorphic-value';

export interface Project {
	name: string;
	description: string;
	url: string;
	language?: string;
}

export const projects: Project[] = [
	{
		name: 'oven-sh/bun',
		description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager',
		url: 'https://github.com/oven-sh/bun',
		language: 'Zig',
	},
	{
		name: 'alii/azs',
		description: 'Amplify your Zod schemas with methods',
		url: 'https://github.com/alii/azs',
		language: 'TypeScript',
	},
	{
		name: 'alii/searchy',
		description: 'Cloudflare + Google = supercharged web surfing',
		url: 'https://github.com/alii/searchy',
		language: 'TypeScript',
	},
	{
		name: 'alii/linear-style',
		description: 'An index for Linear themes',
		url: 'https://github.com/alii/linear-style',
		language: 'TypeScript',
	},
	{
		name: 'alii/use-lanyard',
		description: 'React hook for realtime Discord presence via Lanyard',
		url: 'https://github.com/alii/use-lanyard',
		language: 'TypeScript',
	},
	{
		name: 'alii/use-last-fm',
		description: 'React hook for realtime Last.fm data',
		url: 'https://github.com/alii/use-last-fm',
		language: 'TypeScript',
	},
	{
		name: 'kaito-http/kaito',
		description: 'HTTP framework for TypeScript',
		url: 'https://github.com/kaito-http/kaito',
		language: 'TypeScript',
	},
	{
		name: 'alii/poimandres-terminal',
		description: 'Terminal color profiles inspired by Poimandres VSCode themes',
		url: 'https://github.com/alii/poimandres-terminal',
	},
	{
		name: 'alii/discord-jsx',
		description: 'Experimental Discord bots with JSX',
		url: 'https://github.com/alii/discord-jsx',
		language: 'TypeScript',
	},
	{
		name: 'alii/nextkit',
		description: 'Zero-dependency API toolkit for Next.js',
		url: 'https://github.com/alii/nextkit',
		language: 'TypeScript',
	},
	{
		name: 'alii/permer',
		description: 'Abstraction for handling flags with bitwise operations',
		url: 'https://github.com/alii/permer',
		language: 'TypeScript',
	},
	{
		name: 'alii/arc',
		description: 'JavaScript on the BEAM',
		url: 'https://github.com/alii/arc',
		language: 'Gleam',
	},
	{
		name: 'alii/al',
		description: 'A small, statically-typed, expression-oriented programming language',
		url: 'https://github.com/alii/al',
		language: 'V',
	},
	{
		name: 'alii/trisma',
		description: 'Prisma but with TypeScript for data modelling',
		url: 'https://github.com/alii/trisma',
		language: 'TypeScript',
	},
	{
		name: 'alii/typestr',
		description: 'Zero runtime TypeScript string library using type-level magic',
		url: 'https://github.com/alii/typestr',
		language: 'TypeScript',
	},
];

function formatStars(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	}
	return count.toString();
}

export interface ProjectsListProps {
	stars: Record<string, number>;
}

export function ProjectsList({stars}: ProjectsListProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const [didHoverOrFocusOnceLocalStorage, setDidHoverOrFocusOnce] = useLocalStorage(
		'projects-list:did-hover-or-focus-once',
		() => false,
	);

	const [isLockedOpenLocalStorage, setIsLockedOpen] = useLocalStorage(
		'projects-list:is-locked-open',
		() => false,
	);

	const didHoverOrFocusOnce = useIsomorphicValue(
		() => didHoverOrFocusOnceLocalStorage,
		() => false,
	);

	const isLockedOpen = useIsomorphicValue(
		() => isLockedOpenLocalStorage,
		() => false,
	);

	const isActuallyExpanded = isFocused || isHovered || isLockedOpen;

	const openSideEffect = () => {
		if (!didHoverOrFocusOnce) {
			setIsLockedOpen(true);
			setDidHoverOrFocusOnce(true);
		}
	};

	const hover = () => {
		openSideEffect();
		setIsHovered(true);
	};

	const focus = () => {
		openSideEffect();
		setIsFocused(true);
	};

	const blur = () => setIsFocused(false);
	const out = () => setIsHovered(false);

	const button = useRef<HTMLButtonElement>(null);

	return (
		<div
			className="relative pt-4"
			onMouseOver={hover}
			onMouseOut={out}
			onFocus={focus}
			onBlur={blur}
		>
			<div className="px-4">
				<div className="flex items-start justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
					<p className="mr-4">
						Some of my open source work. Hover to browse, or click the lock to keep it open.
					</p>

					<motion.button
						ref={button}
						title={isLockedOpen ? 'Lock the list open' : 'Unlock the list'}
						className="group z-10 -my-3 -mr-3.5 -ml-6 inline h-fit cursor-pointer px-5 focus-visible:outline-none"
						onClick={() => {
							flushSync(() => {
								setIsLockedOpen(x => !x);
							});

							button.current?.blur();
						}}
						initial={didHoverOrFocusOnce ? 'hidden' : 'shown'}
						animate={didHoverOrFocusOnce ? 'hidden' : 'shown'}
						variants={{
							shown: {
								opacity: 0,
							},
							hidden: {
								opacity: 1,
							},
						}}
					>
						<span className="sr-only">Toggle project list</span>

						<div className="py-6">
							<span className="-m-2 block rounded-md p-2 group-hover:bg-zinc-200 group-focus-visible:ring-2 group-focus-visible:ring-sky-500 dark:group-hover:bg-zinc-800">
								{isLockedOpen && didHoverOrFocusOnce ? (
									<TbLock className="size-4 text-zinc-800 duration-200 dark:text-zinc-400" />
								) : (
									<TbLockOpen className="size-4 text-zinc-800 duration-200 dark:text-zinc-400" />
								)}
							</span>
						</div>
					</motion.button>
				</div>
			</div>

			<motion.div
				initial={isActuallyExpanded ? 'expanded' : 'collapsed'}
				animate={isActuallyExpanded ? 'expanded' : 'collapsed'}
				className="relative overflow-hidden"
				variants={{
					collapsed: {
						height: 72,
					},
					expanded: {
						height: 'auto',
					},
				}}
				transition={{
					type: 'spring',
					mass: 0.2,
					stiffness: 170,
					damping: 20,
				}}
			>
				<div className="flex flex-col p-4 pt-1 pb-1.5">
					{projects.map(project => {
						const starCount = stars[project.name];

						return (
							<a
								key={project.name}
								className="group -mx-2 block rounded-lg py-1"
								href={project.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<div className="rounded-md px-3 py-2 duration-100 group-last:rounded-b-xl group-hover:bg-zinc-200/50 group-active:scale-[0.98] dark:group-hover:bg-zinc-800">
									<div className="flex items-baseline justify-between gap-3">
										<h2 className="font-serif text-base text-black italic dark:text-white">
											{project.name}
										</h2>
										<div className="flex shrink-0 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
											{project.language && (
												<span>{project.language}</span>
											)}
											{starCount != null && (
												<span>{formatStars(starCount)}</span>
											)}
										</div>
									</div>

									<p className="text-zinc-800 dark:text-zinc-400">
										{project.description}
									</p>
								</div>
							</a>
						);
					})}
				</div>

				<AnimatePresence initial={false}>
					{!isActuallyExpanded && (
						<motion.div
							className="pointer-events-none absolute right-0 bottom-0 left-0 h-full bg-gradient-to-t from-zinc-100 to-transparent dark:from-zinc-950/80"
							initial={{
								opacity: 0,
							}}
							animate={{
								opacity: 1,
							}}
							exit={{
								opacity: 0,
							}}
						/>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
