import Link from 'next/link';
import type {ReactNode} from 'react';
import {posts, sortPosts} from '../blog/posts';

export default function Blog() {
	return (
		<main className="mx-auto max-w-xl space-y-4 px-3 pt-24 pb-16">
			<h1 className="font-serif text-2xl">alistair.sh/blog</h1>

			<ul className="list-inside list-disc space-y-1 font-mono">
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
			</ul>
		</main>
	);
}

function BlogLink(props: {readonly href: string; readonly children: ReactNode}) {
	return (
		<li>
			<Link
				className="cursor-default text-sky-500 hover:text-sky-700 dark:hover:text-sky-600"
				href={props.href}
			>
				{props.children}
			</Link>
		</li>
	);
}
