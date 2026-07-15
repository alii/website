import clsx from 'clsx';
import type {GetStaticPaths, GetStaticProps} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {posts} from '../blog/posts';
import {Layout} from '../components/layout';
import {Note} from '../components/note';
import {muted, pageTitle} from '../ui';

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
				<meta name="theme-color" content={post.hidden ? '#ebb305' : '#ffffff'} />
				<meta property="og:image" content={`https://alistair.sh/api/og?slug=${post.slug}`} />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={post.name} />
				<meta name="twitter:description" content={post.excerpt} />
				<meta name="twitter:image" content={`https://alistair.sh/api/og?slug=${post.slug}`} />
				<meta name="twitter:site" content="@alistaiir" />
				<meta name="twitter:creator" content="@alistaiir" />
			</Head>

			{post.hidden && (
				<Note variant="warning" title="Hidden post">
					<p>This post is not listed on the homepage. Please don&apos;t share the link.</p>
				</Note>
			)}

			<article>
				<header className="mb-12">
					<h1 className={`mb-2 leading-tight ${pageTitle}`}>{post.name}</h1>

					<p className={`text-[13px] ${muted}`}>{fmtDate(post.date)}</p>
				</header>

				<div
					className={clsx(
						// serif body for long-form reading; the rest of the site stays sans.
						// tracking resets to normal — the body's tightened letter-spacing is
						// tuned for Karla and cramps Lora at reading size
						'prose prose-stone dark:prose-invert max-w-none font-serif text-[17px] tracking-normal',
						// the post body renders its own <h1> title; we already show it in the
						// header above, so hide the duplicate leading heading
						'[&>h1:first-child]:hidden',
						'prose-headings:font-serif prose-headings:font-semibold',
						'prose-img:w-full',
						// the prose plugin's default pre color is pale gray meant for a dark
						// background; we make pre transparent, so give it readable text again
						'prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-stone-700 dark:prose-pre:text-stone-300',
						// wide content must scroll inside the column, not the page
						'[&_table]:block [&_table]:overflow-x-auto [&_video]:w-full',
						'prose-a:text-orange-800 prose-a:decoration-orange-800/40 prose-a:underline-offset-2 dark:prose-a:text-orange-300 dark:prose-a:decoration-orange-300/40',
						// hover must target the LINK, not the prose container —
						// hover:prose-a:* binds :hover to .prose and lights up every link at once
						'[&_a:hover]:decoration-orange-800 dark:[&_a:hover]:decoration-orange-300',
					)}
				>
					{post.render()}
				</div>

				<footer className="mt-16 text-[15px]">
					<Link href="/">&larr; Home</Link>
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
