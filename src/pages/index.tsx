import dayjs from 'dayjs';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {useLanyardWS, type Data as LanyardData} from 'use-lanyard';
import {TextMarquee} from '../components/xp/components/text-marquee';
import {WindowFrame} from '../components/xp/components/window';
import {getRecentBlogPosts, type PartialBlogPost} from '../server/blog';
import {env} from '../server/env';
import {getLanyard} from '../server/lanyard';
import {discordId} from '../utils/constants';

export interface Props {
	lanyard: LanyardData;
	location: string;
	recentBlogPosts: PartialBlogPost[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const lanyard = await getLanyard(discordId);
	const location = lanyard.kv.location ?? env.DEFAULT_LOCATION;

	const allBlogPosts = await getRecentBlogPosts();
	const recentBlogPosts = allBlogPosts
		.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
		.slice(0, 3);

	return {
		revalidate: 10,
		props: {
			location,
			lanyard,
			recentBlogPosts,
		},
	};
};

export default function Home(props: Props) {
	const lanyard = useLanyardWS(discordId, {
		initialData: props.lanyard,
	})!;

	const status = lanyard.discord_status ?? 'offline';

	const yearProgressPercentage = Math.round(
		(dayjs().diff(dayjs().startOf('year'), 'days') / 365) * 100,
	);

	return (
		<main>
			<WindowFrame onHelp={console.log} title="About Me">
				<div className="max-w-[280px] space-y-4">
					<p>Hi, I'm Alistair. I am a software engineer.</p>
					<img src="/alistair.jpeg" className="size-[150px]" alt="Alistair" />
					<p>
						I an open source enthusiast and I've been called a TypeScript wizard at least a few
						times. I'm interested in things like language specifications and compiler internals.
					</p>
				</div>
			</WindowFrame>

			<WindowFrame title={new Date().getFullYear().toString()}>
				<progress value={yearProgressPercentage} max={100} />
			</WindowFrame>

			<WindowFrame title="Blog posts">
				<div className="max-w-[300px] space-y-4">
					<p>
						I try to write a blog post every now and then. I do OK at that. Everything is on{' '}
						<Link
							href="https://alistair.blog"
							className="text-blue-700 underline hover:text-blue-500"
						>
							alistair.blog
						</Link>
						, but the most recent three are below
					</p>

					<div className="flex flex-col gap-2">
						{props.recentBlogPosts.map(post => (
							<div key={post.slug}>
								<Link
									href={`https://alistair.blog/${post.slug}`}
									target="_blank"
									className="hover:underline"
								>
									<p className="font-bold">{post.name}</p>
									<p className="italic">{dayjs(post.date).format('DD MMMM YYYY')}</p>
									<p>{post.excerpt}</p>
								</Link>
							</div>
						))}
					</div>
				</div>
			</WindowFrame>

			{lanyard.spotify ? (
				<WindowFrame title="Spotify">
					<div className="flex h-[280px] w-[400px] flex-col">
						<div className="flex w-full items-center space-x-4">
							<img
								className="size-16"
								src={lanyard.spotify.album_art_url ?? '/album.png'}
								alt="Album art"
							/>

							<div className="flex-1 space-y-2 overflow-x-hidden">
								<div className="text-lg font-bold">
									{/* <TextMarquee>{lanyard.spotify.song}</TextMarquee> */}
									<TextMarquee>hello</TextMarquee>
								</div>
								<h2 className="text-sm">{lanyard.spotify.artist.split('; ').join(', ')}</h2>
							</div>
						</div>
					</div>
				</WindowFrame>
			) : (
				<WindowFrame title="Music">
					<div className="max-w-[380px] space-y-4">
						<p>
							I listen to a lot of music, and I really love my Drum & Bass. If you come back to this
							page later, you might see what I'm listening to on Spotify, in realtime. In the
							meantime, you can check out{' '}
							<Link
								href="https://www.youtube.com/watch?v=BsPg7bjT1rM"
								className="text-blue-700 underline hover:text-blue-500"
								target="_blank"
							>
								this Four Tet DJ set that I love
							</Link>
						</p>
					</div>
				</WindowFrame>
			)}
		</main>
	);
}
