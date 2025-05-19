import {motion} from 'framer-motion';
import Link from 'next/link';
import type {ReactNode} from 'react';
import {TbArrowLeft} from 'react-icons/tb';
import {posts, sortPosts} from '../blog/posts';
import {BlogFooter} from '../components/blog-footer';
import {useShouldDoInitialPageAnimations} from '../hooks/use-did-initial-page-animations';

export default function Blog() {
	const shouldAnimate = useShouldDoInitialPageAnimations();

	return (
		<main className="mx-auto max-w-xl space-y-4 px-3 pt-24 pb-16">
			<p className="text-sm text-zinc-500 dark:text-zinc-600">
				<Link href="/">
					<TbArrowLeft className="mb-0.5 inline-block" /> Home
				</Link>
			</p>

			<h2 className="font-serif text-xl italic">alistair.sh/blog</h2>

			<motion.ul
				className="list-inside list-disc space-y-1"
				initial={shouldAnimate ? 'hidden' : 'show'}
				animate="show"
				variants={{
					hidden: {opacity: 0, y: 32},
					show: {
						opacity: 1,
						y: 0,
						transition: {staggerChildren: 0.1, ease: [0.22, 1, 0.36, 1]},
					},
				}}
				transition={{
					type: 'spring',
					stiffness: 60,
					damping: 18,
					mass: 1.2,
				}}
			>
				{sortPosts(posts).flatMap(post => {
					if (post.hidden) {
						return [];
					}

					return [
						<BlogLink key={post.slug} href={`/${post.slug}`}>
							{post.name}
						</BlogLink>,
					];
				})}
			</motion.ul>

			<motion.div
				initial={shouldAnimate ? 'hidden' : 'show'}
				animate="show"
				variants={{hidden: {opacity: 0, y: 32}, show: {opacity: 1, y: 0}}}
				transition={{
					type: 'spring',
					stiffness: 60,
					damping: 18,
					mass: 1.2,
					delay: 1,
				}}
			>
				{BlogFooter}
			</motion.div>
		</main>
	);
}

function BlogLink(props: {readonly href: string; readonly children: ReactNode}) {
	return (
		<motion.li
			variants={{
				hidden: {opacity: 0, y: 32},
				show: {
					opacity: 1,
					y: 0,
					transition: {
						type: 'spring',
						stiffness: 60,
						damping: 18,
						mass: 1.2,
						ease: [0.22, 1, 0.36, 1],
					},
				},
			}}
		>
			<Link
				className="cursor-default text-sky-500 hover:text-sky-700 dark:hover:text-sky-600"
				href={props.href}
			>
				{props.children}
			</Link>
		</motion.li>
	);
}
