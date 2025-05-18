import clsx from 'clsx';
import type {GetStaticPaths, GetStaticProps, PageConfig} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {CiGlobe, CiTwitter} from 'react-icons/ci';
import {VscGithubAlt} from 'react-icons/vsc';
import {posts} from '../blog/posts';
import {ExternalLink} from '../components/external-link';
import {Note} from '../components/note';

export const config: PageConfig = {
	unstable_runtimeJS: false,
};

interface Props {
	readonly slug: string;
}

export default function PostPage({slug}: Props) {
	const post = posts.find(post => post.slug === slug)!;

	return (
		<div className="mx-auto w-fit space-y-4 py-28">
			<Head>
				<title>{post.name}</title>
				<meta name="description" content={post.excerpt} />
				<meta name="keywords" content={post.keywords.join(', ')} />
				<meta name="theme-color" content={post.hidden ? '#ebb305' : '#020711'} />
				<meta property="og:image" content={`https://alistair.blog/api/og?slug=${post.slug}`} />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={post.name} />
				<meta name="twitter:description" content={post.excerpt} />
				<meta name="twitter:image" content={`https://alistair.blog/api/og?slug=${post.slug}`} />
				<meta name="twitter:site" content="@alistaiir" />
				<meta name="twitter:creator" content="@alistaiir" />
			</Head>

			<div>
				<Link
					className="font-mono text-blue-500 hover:text-blue-800 dark:text-zinc-400 dark:hover:text-zinc-600"
					href="/"
				>
					../
				</Link>
			</div>

			{post.hidden && (
				<Note variant="warning" title="Hidden post">
					<p>This post is not listed on the homepage. Please don't share the link</p>
				</Note>
			)}

			<p>
				<time dateTime={post.date.toISOString()} className="dark:text-zinc-400">
					{post.date.toDateString()}
				</time>
			</p>

			<main
				className={clsx(
					'prose dark:prose-hr:border-zinc-800 prose-blue prose-img:rounded-md prose-img:w-full dark:prose-invert dark:text-zinc-400',
					'prose-hr:border-zinc-200',
					'dark:prose-headings:text-zinc-300',

					'prose-pre:border prose-pre:border-zinc-200 prose-pre:bg-transparent prose-pre:text-zinc-700 dark:prose-pre:border-zinc-800 dark:prose-pre:text-zinc-300',
				)}
			>
				{post.render()}
			</main>

			<footer>
				<p className="font-mono [&_a]:inline-block [&_a]:px-6 [&_a]:py-4 [&_a:first-child]:pl-0 [&_a:last-child]:pr-0">
					<FooterLink href="https://alistair.sh">
						<CiGlobe className="mr-[3px] mb-[1.5px] inline size-[15px]" />
						<span>alistair.sh</span>
					</FooterLink>

					<FooterLink href="https://twitter.com/alistaiir">
						<CiTwitter className="mr-0.5 inline size-[18px]" />
						<span>alistaiir</span>
					</FooterLink>

					<FooterLink href="https://github.com/alii">
						<VscGithubAlt className="mr-[3px] inline size-[14px]" />
						<span>alii</span>
					</FooterLink>
				</p>
			</footer>
		</div>
	);
}

function FooterLink({href, children}: {href: string; children: React.ReactNode}) {
	return (
		<ExternalLink
			href={href}
			className="cursor-default text-sm text-zinc-400 decoration-blue-500/20 hover:underline hover:decoration-blue-500/50 dark:text-zinc-700"
		>
			{children}
		</ExternalLink>
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
