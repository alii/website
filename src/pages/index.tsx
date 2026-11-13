import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {get, useLanyard, type Types} from 'use-lanyard';
import {posts, sortPosts} from '../blog/posts';
import {Glyph} from '../components/glyph';
import {Layout} from '../components/layout';
import {PostListing} from '../components/post-listing';
import {env} from '../server/env';
import {boxHd, muted} from '../ui';
import {backupDiscordId, discordId} from '../utils/constants';

export interface Props {
	lanyard: Types.Presence | null;
	backupLanyard: Types.Presence | null;
	location: string;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const lanyard = await get(discordId).catch(() => null);
	const backupLanyard = await get(backupDiscordId).catch(() => null);
	const location = lanyard?.kv.location ?? env.DEFAULT_LOCATION;

	return {
		revalidate: 10,
		props: {
			location,
			lanyard,
			backupLanyard,
		},
	};
};

export default function Home(props: Props) {
	const {[discordId]: lanyard, [backupDiscordId]: backupLanyard} = useLanyard(
		[discordId, backupDiscordId],
		{
			initialData: {
				[discordId]: props.lanyard ?? undefined,
				[backupDiscordId]: props.backupLanyard ?? undefined,
			},
		},
	);

	const spotify = lanyard?.spotify ?? backupLanyard?.spotify ?? null;
	const location = lanyard?.kv.location ?? props.location;

	const visible = sortPosts(posts).filter(post => !post.hidden);

	return (
		<Layout>
			<Glyph />

			<h1 className="mb-6 text-[15px] font-bold text-stone-950 dark:text-stone-50">
				Alistair Smith
			</h1>

			<div className="space-y-4">
				<p>
					I work at{' '}
					<Link href="https://www.anthropic.com/" target="_blank">
						Anthropic
					</Link>{' '}
					on{' '}
					<Link href="https://bun.com" target="_blank">
						Bun
					</Link>{' '}
					and{' '}
					<Link href="https://www.claude.com/product/claude-code" target="_blank">
						Claude Code
					</Link>
					.
				</p>

				<p>
					Before that, I built a cloud platform and an AI research app on early language models.
					I&apos;ve worked on software with 100M+ monthly downloads and lots of open source.
					I&apos;m interested in interpreters, language design, and excellent products. It&apos;s
					nice to meet you.
				</p>

				<p className={muted}>
					Currently in{' '}
					<Link href={`https://maps.apple.com/?q=${location}`} target="_blank">
						{location}
					</Link>
					.
					{spotify && (
						<>
							{' '}
							Listening to{' '}
							<Link href={`https://open.spotify.com/track/${spotify.track_id}`} target="_blank">
								{spotify.song}
							</Link>
							{spotify.artist && <> by {spotify.artist.split('; ').join(', ')}</>}.
						</>
					)}
				</p>
			</div>

			<section className="mt-16">
				<h2 className={boxHd}>writing</h2>
				<PostListing posts={visible} />
			</section>
		</Layout>
	);
}
