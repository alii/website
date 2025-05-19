import {AnimatePresence, motion} from 'framer-motion';
import {useState} from 'react';
import {TbLock, TbLockOpen} from 'react-icons/tb';
import {posts} from '../blog/posts';

const allPosts = posts.filter(post => !post.hidden);

export function BlogPostList() {
	const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
	const [isLockedOpen, setIsLockedOpen] = useState(false);
	const [didHoverOrFocusOnce, setDidHoverOrFocusOnce] = useState(false);

	const isActuallyExpanded = isHoveredOrFocused || isLockedOpen;

	const hoverOrFocus = () => {
		if (!didHoverOrFocusOnce) {
			setIsLockedOpen(true);
			setDidHoverOrFocusOnce(true);
		}
		setIsHoveredOrFocused(true);
	};

	const outOrBlur = () => {
		setIsHoveredOrFocused(false);
	};

	return (
		<div
			className="relative overflow-hidden pt-4"
			onMouseOver={hoverOrFocus}
			onMouseOut={outOrBlur}
			onFocus={hoverOrFocus}
			onBlur={outOrBlur}
		>
			<div className="px-4">
				<div className="items-tart flex justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
					<p className="mr-4">
						I try to write a blog post every now and then, often about some of the things I've been
						working on. Hover your mouse here to see the full list.
					</p>

					<motion.button
						title={isLockedOpen ? 'Lock the list open' : 'Unlock the list'}
						className="group z-10 -my-3 -mr-3.5 -ml-6 inline h-fit cursor-pointer px-5 focus:outline-none"
						onClick={() => {
							setIsLockedOpen(x => !x);
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
						height: 80,
					},
					expanded: {
						height: 'auto',
					},
				}}
			>
				<div className="flex flex-col p-4 pb-2.5">
					{allPosts.map(post => {
						return (
							<a
								key={post.slug}
								className="group -mx-2 block rounded-lg py-1"
								href={`/${post.slug}`}
							>
								<div className="rounded-md px-2 py-2 duration-100 group-hover:bg-zinc-200/50 dark:group-hover:bg-zinc-800">
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
							className="absolute right-0 bottom-0 left-0 h-full rounded-b-xl bg-gradient-to-t from-zinc-300 to-transparent dark:from-zinc-950/80"
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
