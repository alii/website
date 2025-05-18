import {get} from '@prequist/lanyard';
import {motion} from 'framer-motion';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {SiSpotify} from 'react-icons/si';
import {useLanyardWS, type Types} from 'use-lanyard';
import album from '../../public/album.png';
import type {Post} from '../blog/Post';
import {posts} from '../blog/posts';
import {MessageGroup, type Message} from '../components/message';
import {env} from '../server/env';
import {discordId} from '../utils/constants';

export interface Props {
	lanyard: Types.Presence;
	location: string;
	recentBlogPosts: Post.TinyJSON[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const lanyard = await get(discordId);
	const location = lanyard.kv.location ?? env.DEFAULT_LOCATION;

	const recentBlogPosts = [...posts]
		.filter(post => !post.hidden)
		// .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
		.slice(0, 3)
		.map(post => post.toTinyJSON());

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
	});

	return (
		<main className="mx-auto max-w-xl px-3 pt-24 pb-16">
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
									I try to write a blog post every now and then. I do OK at that. Below are the most
									recent three.
								</div>
							),
						},

						...props.recentBlogPosts.map(
							(post): Message => ({
								key: post.slug,
								className: 'hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors',
								content: (
									<Link
										href={`/${post.slug}`}
										key={post.slug}
										className="block w-fit min-w-[300px] overflow-hidden px-4 py-2.5"
									>
										<h2 className="font-serif text-base text-black italic dark:text-white">
											{post.name}
										</h2>
										<p className="text-zinc-800 dark:text-zinc-400">{post.excerpt}</p>
									</Link>
								),
							}),
						),
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
												className="group relative mb-1! block w-full min-w-[300px] cursor-default overflow-hidden rounded-[20px] p-4"
												target="_blank"
											>
												<div className="absolute inset-0">
													<div className="absolute inset-0 z-10 bg-white/70 transition-colors group-hover:bg-white/80 dark:bg-zinc-800/80 dark:group-hover:bg-zinc-800/85"></div>
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
														{lanyard.spotify.artist && (
															<p className="line-clamp-1 text-zinc-800 dark:text-white/60">
																{lanyard.spotify.artist.split('; ').join(', ')}
															</p>
														)}
													</div>
												</div>

												<div className="absolute top-4 right-4 z-10">
													<SiSpotify className="size-4 text-zinc-900/80 dark:text-white/50" />
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
													className="inline-block underline decoration-zinc-200/50 dark:decoration-zinc-400"
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
										className="underline decoration-zinc-200/50 dark:decoration-zinc-400"
										target="_blank"
									>
										Evolve skateboard
									</Link>
									,{' '}
									<Link
										href="https://www.youtube.com/watch?v=x6vlL9Sscmw"
										className="underline decoration-zinc-200/50 dark:decoration-zinc-400"
										target="_blank"
									>
										DJing (on YouTube)
									</Link>{' '}
									or{' '}
									<Link
										href="https://soundcloud.com/alistairsmusic/"
										className="underline decoration-zinc-400 dark:decoration-zinc-200/50"
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

									<span className="absolute top-1/2 left-1/2 z-10 -mt-7 -ml-7 block size-14 animate-ping rounded-full bg-lime-500 duration-1000" />

									<img
										src={`https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.webp?size=160`}
										alt="Avatar"
										className="absolute top-1/2 left-1/2 z-10 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
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
										className="underline decoration-zinc-200/50 dark:decoration-zinc-400"
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
											}[lanyard.discord_status]
										}
									>
										{
											{
												dnd: 'in dnd',
												idle: 'idle',
												online: 'online',
												offline: 'offline',
											}[lanyard.discord_status]
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
										className="underline decoration-zinc-200/50 dark:decoration-zinc-400"
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
										className="underline decoration-zinc-200/50 dark:decoration-zinc-400"
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
