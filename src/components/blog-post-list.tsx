import {useLocalStorage} from 'alistair/hooks';
import {AnimatePresence, motion} from 'framer-motion';
import {useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {TbLock, TbLockOpen} from 'react-icons/tb';
import {posts} from '../blog/posts';
import {useIsomorphicValue} from '../hooks/use-isomorphic-value';

const allPosts = posts.filter(post => !post.hidden);

export function BlogPostList() {
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const [didHoverOrFocusOnceLocalStorage, setDidHoverOrFocusOnce] = useLocalStorage(
		'blog-post-list:did-hover-or-focus-once',
		() => false,
	);

	const [isLockedOpenLocalStorage, setIsLockedOpen] = useLocalStorage(
		'blog-post-list:is-locked-open',
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
				<div className="items-tart flex justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
					<p className="mr-4">
						I try to write every now and then, often about stuff I've recently been working on.
						Hover your mouse here to see the list.
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
						<span className="sr-only">Toggle blog post list</span>

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
					duration: 0.7,
					type: 'spring',
					bounce: 0.2,
					mass: 0.5,
					stiffness: 100,
					damping: 10,
				}}
			>
				<div className="flex flex-col p-4 pt-1 pb-1.5">
					{allPosts.map(post => {
						return (
							<a
								key={post.slug}
								className="group -mx-2 block rounded-lg py-1"
								href={`/${post.slug}`}
							>
								<div className="rounded-md px-3 py-2 duration-100 group-last:rounded-b-xl group-hover:bg-zinc-200/50 group-active:scale-[0.98] dark:group-hover:bg-zinc-800">
									<h2 className="font-serif text-base text-black italic dark:text-white">
										{post.name}
									</h2>

									<p className="text-zinc-800 dark:text-zinc-400">{post.excerpt}</p>
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
