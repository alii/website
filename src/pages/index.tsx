import {get} from '@prequist/lanyard';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {SiSpotify} from 'react-icons/si';
import {useLanyardWS, type Types} from 'use-lanyard';
import {posts, sortPosts} from '../blog/posts';
import {Layout} from '../components/layout';
import {PostListing} from '../components/post-listing';
import {box, boxBd, boxHd, pinrow, pinrowK, thingTagline} from '../ui';
import {env} from '../server/env';
import {backupDiscordId, discordId} from '../utils/constants';
import {parseVotes} from '../utils/votes';

export interface Props {
	lanyard: Types.Presence;
	backupLanyard: Types.Presence;
	location: string;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const lanyard = await get(discordId);
	const backupLanyard = await get(backupDiscordId);
	const location = lanyard.kv.location ?? env.DEFAULT_LOCATION;

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
	const lanyard = useLanyardWS(discordId, {
		initialData: props.lanyard,
	});

	const backupLanyard = useLanyardWS(backupDiscordId, {
		initialData: props.backupLanyard,
	});

	const spotify = lanyard.spotify ?? backupLanyard?.spotify ?? null;
	const location = lanyard.kv.location ?? props.location;
	const votes = parseVotes(lanyard.kv);

	const recent = sortPosts(posts)
		.filter(post => !post.hidden)
		.slice(0, 6);

	const sidebar = (
		<>
			<section className={box}>
				<div className={boxHd}>
					about <span className="text-[#f48024]">alistair</span>
				</div>
				<div className={boxBd}>
					<p>
						I&apos;m <strong>Alistair</strong>. I work at{' '}
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
						I&apos;m interested in language specifications and type systems. I&apos;ve been called a
						TypeScript wizard at least a few times. It&apos;s nice to meet you.
					</p>
				</div>
			</section>

			{spotify && (
				<section className={box}>
					<div className={boxHd}>
						<SiSpotify className="mb-px mr-1 inline" /> now playing
					</div>
					<div className={boxBd}>
						<Link
							href={`https://open.spotify.com/track/${spotify.track_id}`}
							target="_blank"
							className="flex items-start gap-2.5 !text-inherit hover:no-underline"
						>
							<img
								src={spotify.album_art_url ?? '/album.png'}
								alt="Album art"
								width={48}
								height={48}
								className="size-12 shrink-0 border border-zinc-300 dark:border-zinc-700"
							/>
							<span className="min-w-0">
								<strong className="block truncate">{spotify.song}</strong>
								{spotify.artist && (
									<span className="block truncate text-zinc-500 dark:text-zinc-400">
										{spotify.artist.split('; ').join(', ')}
									</span>
								)}
							</span>
						</Link>
					</div>
				</section>
			)}

			<section className={box}>
				<div className={boxHd}>whereabouts</div>
				<div className={boxBd}>
					<div className="relative mb-2 h-[130px] overflow-hidden border border-zinc-300 dark:border-zinc-700">
						<img
							src={`/api/map?location=${location}&theme=light`}
							alt="Map"
							className="absolute inset-0 size-full scale-125 object-cover dark:hidden"
						/>
						<img
							src={`/api/map?location=${location}&theme=dark`}
							alt="Map"
							className="absolute inset-0 hidden size-full scale-125 object-cover dark:block"
						/>
						<img
							src={`https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.webp?size=160`}
							alt="Avatar"
							className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_#ff4500]"
						/>
					</div>
					<p>
						Currently in{' '}
						<Link href={`https://maps.apple.com/?q=${location}`} target="_blank">
							{location}
						</Link>
						.
					</p>
				</div>
			</section>

			<section className={box}>
				<div className={boxHd}>find me online</div>
				<div className={boxBd}>
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
					<div className={pinrow}>
						<span className={pinrowK}>work</span>
						<span className="min-w-0 flex-1">
							<Link href="https://www.anthropic.com/" target="_blank">
								Anthropic
							</Link>
						</span>
					</div>
				</div>
			</section>
		</>
	);

	return (
		<Layout sidebar={sidebar}>
			<PostListing posts={recent} votes={votes} showTags={false} />
			<p className={`${thingTagline} mt-3`}>
				<Link href="/blog">view all posts &raquo;</Link>
			</p>
		</Layout>
	);
}
