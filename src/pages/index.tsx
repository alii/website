import dayjs from 'dayjs';
import {motion} from 'framer-motion';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {SiSpotify} from 'react-icons/si';
import {useLanyardWS, type Data as LanyardData} from 'use-lanyard';
import album from '../../public/album.png';
import {MessageGroup} from '../components/message';
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

	return (
		<main className="mx-auto max-w-xl px-3 pb-16 pt-24">
			<motion.ul
				transition={{
					staggerChildren: 0.6,
					delayChildren: 0.3,
				}}
				initial="hidden"
				animate="show"
				className="space-y-8"
			>
				<MessageGroup
					messages={[
						{
							key: 'intro',
							content: (
								<div className="px-4 py-2.5">
									I'm <span className="font-serif italic">Alistair</span>, I'm a software engineer
								</div>
							),
						},
						{
							key: 'what-i-do',
							content: (
								<p className="px-4 py-2.5">
									I an open source enthusiast and I've been called a TypeScript wizard at least a
									few times. I'm interested in things like language specifications and compiler
									internals.
								</p>
							),
						},
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'blog-intro',
							content: (
								<div className="px-4 py-2.5">
									I try to write a blog post every now and then. I do OK at that. Everything is on{' '}
									<Link
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
										href="https://alistair.blog"
									>
										alistair.blog
									</Link>
									, but the most recent three are below
								</div>
							),
						},

						...props.recentBlogPosts.map(post => ({
							key: post.slug,
							content: (
								<Link
									href={`https://alistair.blog/${post.slug}`}
									key={post.slug}
									className="group block w-fit min-w-[300px] overflow-hidden px-4 py-2.5"
								>
									<h2 className="font-serif text-base italic group-hover:text-lime-600 dark:group-hover:text-lime-400">
										{post.name}
									</h2>
									<p className="text-neutral-800 dark:text-neutral-500">{post.excerpt}</p>
								</Link>
							),
						})),
					]}
				/>

				<MessageGroup
					messages={[
						...(lanyard.spotify
							? [
									{
										key: 'music',
										content: (
											<div className="max-w-[380px] space-y-3 px-4 py-2.5">
												<p>
													I listen to a lot of music. I love all electronic music, and{' '}
													<i>right now</i> I am listening to this on Spotify:
												</p>
											</div>
										),
									},

									{
										key: 'the-current-song',
										content: (
											<Link
												href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
												className="group relative !mb-1 block w-full min-w-[300px] cursor-default overflow-hidden rounded-[20px] p-4"
												target="_blank"
											>
												<div className="absolute inset-0">
													<div className="absolute inset-0 z-10 bg-white/70 transition-colors group-hover:bg-white/80 dark:bg-neutral-800/80 dark:group-hover:bg-neutral-800/85"></div>
													<img
														src={lanyard.spotify.album_art_url ?? album.src}
														alt="Album art"
														aria-hidden
														className="absolute top-1/2 -translate-y-1/2 scale-[3] blur-3xl saturate-[50] dark:saturate-[10]"
													/>
												</div>

												<div className="relative z-10 flex items-center space-x-4 pr-8">
													<img
														src={lanyard.spotify.album_art_url ?? album.src}
														alt="Album art"
														className="size-12 rounded-md border-2"
													/>

													<div className="space-y-1">
														<p className="line-clamp-1">
															<strong>{lanyard.spotify.song}</strong>
														</p>
														<p className="line-clamp-1 text-neutral-800 dark:text-white/60">
															{lanyard.spotify.artist.split('; ').join(', ')}
														</p>
													</div>
												</div>

												<div className="absolute right-4 top-4 z-10">
													<SiSpotify className="size-4 text-neutral-900/80 dark:text-white/50" />
												</div>
											</Link>
										),
									},
								]
							: [
									{
										key: 'music',
										content: (
											<p className="px-4 py-2.5">
												I listen to a lot of music, and I really love my Drum & Bass. If you come
												back to this page later, you might see what I'm listening to on Spotify, in
												realtime. In the meantime, you can check out
												<Link
													href="https://www.youtube.com/watch?v=BsPg7bjT1rM"
													className="inline-block nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
													target="_blank"
												>
													this Four Tet DJ set that I love
												</Link>
											</p>
										),
									},
								]),
						{
							key: 'not-music',
							content: (
								<div className="px-4 py-2.5">
									In the rare case I'm not listening to anything, you can usually find me out and
									about riding my{' '}
									<Link
										href="https://www.youtube.com/watch?v=LBx-JCj-7Y8"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
										target="_blank"
									>
										Evolve skateboard
									</Link>
									,{' '}
									<Link
										href="https://www.youtube.com/watch?v=x6vlL9Sscmw"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
										target="_blank"
									>
										DJing (on YouTube)
									</Link>{' '}
									or{' '}
									<Link
										href="https://soundcloud.com/alistairsmusic/"
										className="underline decoration-neutral-400 dark:decoration-neutral-200/50"
										target="_blank"
									>
										trying my hardest to figure out Ableton Live
									</Link>
								</div>
							),
						},
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'location',
							content: (
								<div className="relative my-1 h-[150px] w-[300px]">
									<div className="absolute inset-0 overflow-hidden rounded-[20px]">
										<img
											src={`/api/map?location=${lanyard.kv.location}&theme=light`}
											alt="Map"
											className="absolute inset-0 h-full w-full scale-125 object-cover dark:hidden"
										/>
										<img
											src={`/api/map?location=${lanyard.kv.location}&theme=dark`}
											alt="Map"
											className="absolute inset-0 hidden h-full w-full scale-125 object-cover dark:block"
										/>
									</div>

									<span className="absolute left-1/2 top-1/2 z-10 -ml-7 -mt-7 block size-14 animate-ping rounded-full bg-lime-500 duration-1000" />

									<img
										src={`https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.webp?size=160`}
										alt="Avatar"
										className="absolute left-1/2 top-1/2 z-10 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
									/>
								</div>
							),
						},
						{
							key: 'location-caption',
							content: (
								<p className="px-4 py-2.5">
									Right now I am in{' '}
									<Link
										href={`https://maps.apple.com/?q=${lanyard.kv.location}`}
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
										target="_blank"
									>
										{lanyard.kv.location}
									</Link>{' '}
									📍
								</p>
							),
						},
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'chat-1',
							content: (
								<div className="max-w-[330px] px-4 py-2.5">
									Want to reach me? I'd love to chat, whether you want to pitch an idea, or just say
									hi.
								</div>
							),
						},
						{
							key: 'discord',
							content: (
								<div className="px-4 py-2.5">
									My Discord is <code className="font-serif italic">@alistaiir</code> - I'm
									currently{' '}
									<span
										className={
											{
												dnd: 'text-red-600 dark:text-red-400',
												idle: 'text-amber-500',
												online: 'text-green-500',
												offline: 'text-blurple',
											}[status]
										}
									>
										{
											{
												dnd: 'in dnd',
												idle: 'idle',
												online: 'online',
												offline: 'offline',
											}[status]
										}
									</span>
								</div>
							),
						},
						{
							key: 'chat-2',
							content: (
								<div className="px-4 py-2.5">
									Otherwise, I'm on{' '}
									<Link
										href="https://x.com/alistaiir"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
										target="_blank"
									>
										Twitter/X
									</Link>
								</div>
							),
						},
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'experiments',
							content: (
								<div className="px-4 py-2.5">
									I have some fun experiments on this site, some are functional things I use, others
									are just me messing around.{' '}
									<Link
										href="/experiments"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
									>
										Click here to see them
									</Link>
									.
								</div>
							),
						},
					]}
				/>
			</motion.ul>
		</main>
	);
}
