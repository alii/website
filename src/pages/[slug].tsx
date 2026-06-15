import clsx from 'clsx';
import type {GetStaticPaths, GetStaticProps} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {posts} from '../blog/posts';
import {Layout} from '../components/layout';
import {Note} from '../components/note';
import {breadcrumb, tag} from '../ui';
import {normalizeTag} from '../utils/tags';

interface Props {
	readonly slug: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(date: Date) {
	return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export default function PostPage({slug}: Props) {
	const post = posts.find(post => post.slug === slug)!;

	return (
		<Layout>
			<Head>
				<title>{post.name}</title>
				<meta name="description" content={post.excerpt} />
				<meta name="keywords" content={post.keywords.join(', ')} />
				<meta name="theme-color" content={post.hidden ? '#ebb305' : '#cee3f8'} />
				<meta property="og:image" content={`https://alistair.sh/api/og?slug=${post.slug}`} />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={post.name} />
				<meta name="twitter:description" content={post.excerpt} />
				<meta name="twitter:image" content={`https://alistair.sh/api/og?slug=${post.slug}`} />
				<meta name="twitter:site" content="@alistaiir" />
				<meta name="twitter:creator" content="@alistaiir" />
			</Head>

			<div className={breadcrumb}>
				<Link href="/">home</Link>
				<span className="text-zinc-400 dark:text-zinc-600">&rsaquo;</span>
				<Link href="/blog">blog</Link>
				<span className="text-zinc-400 dark:text-zinc-600">&rsaquo;</span>
				<span>{post.name}</span>
			</div>

			{post.hidden && (
				<Note variant="warning" title="Hidden post">
					<p>This post is not listed on the homepage. Please don&apos;t share the link.</p>
				</Note>
			)}

			<article className="border border-t-[3px] border-zinc-300 border-t-[#f48024] bg-white dark:border-zinc-700 dark:border-t-[#f48024] dark:bg-zinc-900">
				<header className="border-b border-zinc-300 px-[18px] pt-3.5 pb-2.5 dark:border-zinc-700">
					<h1 className="mb-2 text-2xl leading-tight font-semibold text-zinc-900 dark:text-zinc-100">
						{post.name}
					</h1>
					<div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
						<span>
							Posted{' '}
							<strong className="font-semibold text-zinc-700 dark:text-zinc-300">
								{fmtDate(post.date)}
							</strong>
						</span>
						<span>
							by <strong className="font-semibold text-zinc-700 dark:text-zinc-300">alii</strong>
						</span>
						{post.keywords.length > 0 && (
							<span className="flex flex-wrap gap-1">
								{post.keywords.map(keyword => {
									const t = normalizeTag(keyword);
									return (
										<Link className={tag} key={t} href={`/blog?tag=${encodeURIComponent(t)}`}>
											{t}
										</Link>
									);
								})}
							</span>
						)}
					</div>
				</header>

				<div className="p-[18px]">
					<div
						className={clsx(
							'prose prose-sky max-w-none dark:prose-invert',
							// the post body renders its own <h1> title; we already show it in the
							// header above, so hide the duplicate leading heading
							'[&>h1:first-child]:hidden',
							'prose-img:w-full prose-img:rounded-none prose-img:border prose-img:border-zinc-300 dark:prose-img:border-zinc-700',
							'prose-pre:rounded-none prose-pre:border prose-pre:border-zinc-300 prose-pre:bg-transparent prose-pre:text-zinc-700 dark:prose-pre:border-zinc-700 dark:prose-pre:text-zinc-300',
							'prose-headings:font-sans',
						)}
					>
						{post.render()}
					</div>
				</div>

				<footer className="flex flex-wrap items-center gap-2.5 border-t border-zinc-300 bg-zinc-100 px-[18px] py-3 dark:border-zinc-700 dark:bg-zinc-800">
					<Link className="font-mono" href="/blog">
						&laquo; back to all posts
					</Link>
					<span className="ml-auto" />
					<Link href="https://x.com/intent/user?screen_name=alistaiir">@alistaiir</Link>
					<Link href="https://github.com/alii">github/alii</Link>
				</footer>
			</article>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
	const slug = params!.slug as string;

	const post = posts.find(post => post.slug === slug);

	if (!post) {
		return {notFound: true};
	}

	return {
		props: {slug},
	};
};

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: posts.map(post => ({params: {slug: post.slug}})),
	fallback: 'blocking',
});
