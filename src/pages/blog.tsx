import {get} from '@prequist/lanyard';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useLanyardWS, type Types} from 'use-lanyard';
import {posts, sortPosts} from '../blog/posts';
import {Layout} from '../components/layout';
import {PostListing} from '../components/post-listing';
import {TagCloud} from '../components/tag-cloud';
import {banner, box, boxBd, boxHd, breadcrumb, pinrow, pinrowK, sectionTitle, tag} from '../ui';
import {discordId} from '../utils/constants';
import {normalizeTag} from '../utils/tags';
import {parseVotes} from '../utils/votes';

export interface Props {
	lanyard: Types.Presence | null;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const lanyard = await get(discordId).catch(() => null);

	return {
		revalidate: 10,
		props: {lanyard},
	};
};

export default function Blog(props: Props) {
	const lanyard = useLanyardWS(discordId, props.lanyard ? {initialData: props.lanyard} : {});
	const votes = parseVotes(lanyard?.kv);

	const router = useRouter();
	const activeTag = typeof router.query.tag === 'string' ? normalizeTag(router.query.tag) : null;

	const visible = sortPosts(posts)
		.filter(post => !post.hidden)
		.filter(
			post => !activeTag || post.keywords.some(keyword => normalizeTag(keyword) === activeTag),
		);

	const sep = <span className="text-zinc-400 dark:text-zinc-600">&rsaquo;</span>;

	const sidebar = (
		<>
			<section className={box}>
				<div className={boxHd}>about this blog</div>
				<div className={boxBd}>
					<p>
						I write every now and then, usually about TypeScript, type systems, or whatever
						I&apos;ve recently been working on.
					</p>
					<p>
						{visible.length} post{visible.length === 1 ? '' : 's'} and counting.
					</p>
				</div>
			</section>

			<section className={box}>
				<div className={boxHd}>elsewhere</div>
				<div className={boxBd}>
					<div className={pinrow}>
						<span className={pinrowK}>home</span>
						<span className="min-w-0 flex-1">
							<Link href="/">alistair.sh</Link>
						</span>
					</div>
					<div className={pinrow}>
						<span className={pinrowK}>github</span>
						<span className="min-w-0 flex-1">
							<Link href="https://github.com/alii" target="_blank">
								@alii
							</Link>
						</span>
					</div>
					<div className={pinrow}>
						<span className={pinrowK}>twitter</span>
						<span className="min-w-0 flex-1">
							<Link href="https://x.com/intent/user?screen_name=alistaiir" target="_blank">
								@alistaiir
							</Link>
						</span>
					</div>
				</div>
			</section>

			<section className={box}>
				<div className={boxHd}>topics</div>
				<div className={boxBd}>
					<TagCloud />
				</div>
			</section>
		</>
	);

	return (
		<Layout sidebar={sidebar}>
			<div className={breadcrumb}>
				<Link href="/">home</Link>
				{sep}
				{activeTag ? <Link href="/blog">blog</Link> : <span>blog</span>}
				{activeTag && (
					<>
						{sep}
						<span>{activeTag}</span>
					</>
				)}
			</div>

			<p className={sectionTitle}>
				{activeTag ? (
					<>
						posts tagged <span className={tag}>{activeTag}</span> &mdash; {visible.length} found{' '}
						<Link href="/blog" className="font-normal normal-case">
							&times; clear
						</Link>
					</>
				) : (
					'all posts — sorted by newest'
				)}
			</p>

			{visible.length === 0 ? (
				<div className={banner}>
					No posts tagged <strong>{activeTag}</strong>.{' '}
					<Link href="/blog">Back to all posts &raquo;</Link>
				</div>
			) : (
				<PostListing posts={visible} votes={votes} />
			)}
		</Layout>
	);
}
