import {useLocalStorage} from 'alistair/hooks';
import {AnimatePresence, motion} from 'framer-motion';
import {useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {TbLock, TbLockOpen} from 'react-icons/tb';
import {useIsomorphicValue} from '../hooks/use-isomorphic-value';

export interface GitHubRepo {
	name: string;
	description: string;
	language: string | null;
	stars: number;
	url: string;
}

export const projectNames = [
	'oven-sh/bun',
	'alii/azs',
	'alii/searchy',
	'alii/linear-style',
	'alii/use-lanyard',
	'alii/use-last-fm',
	'kaito-http/kaito',
	'alii/poimandres-terminal',
	'alii/discord-jsx',
	'alii/nextkit',
	'alii/permer',
	'alii/arc',
	'alii/al',
	'alii/trisma',
	'alii/typestr',
];

const languageColors: Record<string, string> = {
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Zig: '#ec915c',
	Rust: '#dea584',
	Go: '#00add8',
	Python: '#3572a5',
	Gleam: '#ffaff3',
	V: '#4f87c4',
	CSS: '#563d7c',
	HTML: '#e34c26',
	Shell: '#89e051',
	C: '#555555',
	'C++': '#f34b7d',
};

export interface ProjectsListProps {
	repos: GitHubRepo[];
}

export function ProjectsList({repos}: ProjectsListProps) {
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
						Open source I've built or contributed to.
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
					{repos.map(repo => {
						const [org, name] = repo.name.split('/');
						const langColor = repo.language ? languageColors[repo.language] ?? '#888' : null;

						return (
							<a
								key={repo.name}
								className="group -mx-2 block rounded-lg py-0.5"
								href={repo.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<div className="rounded-md px-3 py-1.5 duration-100 group-last:rounded-b-xl group-hover:bg-zinc-200/50 group-active:scale-[0.98] dark:group-hover:bg-zinc-800">
									<div className="flex items-baseline justify-between gap-2">
										<h2 className="min-w-0 truncate font-serif text-base text-black italic dark:text-white">
											<span className="text-zinc-400 dark:text-zinc-600">{org}/</span>{name}
										</h2>
										{langColor && repo.language && (
											<span className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500">
												<span
													className="inline-block size-2 rounded-full"
													style={{backgroundColor: langColor}}
												/>
												{repo.language}
											</span>
										)}
									</div>

									<p className="truncate text-sm text-zinc-600 dark:text-zinc-500">
										{repo.description}
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
