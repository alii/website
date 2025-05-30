import {get} from '@prequist/lanyard';
import {motion} from 'framer-motion';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {CiTwitter} from 'react-icons/ci';
import {SiBun, SiGithub, SiSpotify} from 'react-icons/si';
import {useLanyardWS, type Types} from 'use-lanyard';
import album from '../../public/album.png';
import type {Post} from '../blog/Post';
import {posts} from '../blog/posts';
import {BlogPostList} from '../components/blog-post-list';
import {message, MessageGroup} from '../components/message';
import {useShouldDoInitialPageAnimations} from '../hooks/use-did-initial-page-animations';
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

	const shouldAnimate = useShouldDoInitialPageAnimations();

	return (
		<main className="mx-auto max-w-xl px-3 pt-24 pb-16">
			<motion.ul
				transition={{
					staggerChildren: 0.1,
					delayChildren: 0.1,
				}}
				initial={shouldAnimate ? 'hidden' : 'show'}
				animate="show"
				className="space-y-8"
			>
				<MessageGroup
					messages={[
						{
							key: 'intro',
							content: (
								<div className="px-4 py-2.5">
									I'm <span className="font-serif italic">Alistair</span>. I work on
									<SiBun className="mb-[3px] ml-1 inline" />{' '}
									<Link
										href="https://bun.sh"
										className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
										target="_blank"
									>
										Bun, the fast JavaScript runtime
									</Link>
									. I'm interested in things like language specifications and type systems. I've
									been called a TypeScript wizard at least a few times.
								</div>
							),
						},
					]}
				/>

				{lanyard.spotify && (
					<MessageGroup
						messages={[
							{
								key: 'music',
								content: (
									<div className="max-w-[380px] space-y-3 px-4 py-2.5">
										<p>
											I listen to a lot of music, and{' '}
											<span className="font-serif italic">right now</span> I'm listening to this song on Spotify:
										</p>
									</div>
								),
							},

							{
								key: 'the-current-song',
								content: (
									<Link
										href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
										className="group relative block w-full min-w-[300px] cursor-default overflow-hidden rounded-[20px] p-4"
										target="_blank"
									>
										<div className="absolute inset-0">
											<div className="absolute inset-0 z-10 bg-white/70 transition-colors group-hover:bg-white/80 dark:bg-zinc-800/80 dark:group-hover:bg-zinc-800/85"></div>
											<img
												src={lanyard.spotify.album_art_url ?? album.src}
												alt="Album art"
												aria-hidden
												className="absolute top-1/2 -translate-y-1/2 blur-3xl saturate-[50] dark:saturate-[10]"
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
						]}
					/>
				)}

				{/* <MessageGroup
					messages={[
						...(lanyard.spotify
							? []
							: []),
						// {
						// 	key: 'not-music',
						// 	content: (
						// 		<div className="px-4 py-2.5">
						// 			In the rare case I'm not listening to anything, you can usually find me out and
						// 			about riding my{' '}
						// 			<Link
						// 				href="https://www.youtube.com/watch?v=LBx-JCj-7Y8"
						// 				className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
						// 				target="_blank"
						// 			>
						// 				Evolve skateboard
						// 			</Link>
						// 			,{' '}
						// 			<Link
						// 				href="https://www.youtube.com/watch?v=x6vlL9Sscmw"
						// 				className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
						// 				target="_blank"
						// 			>
						// 				DJing (on YouTube)
						// 			</Link>{' '}
						// 			or{' '}
						// 			<Link
						// 				href="https://soundcloud.com/alistairsmusic/"
						// 				className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
						// 				target="_blank"
						// 			>
						// 				trying my hardest to figure out Ableton Live
						// 			</Link>
						// 		</div>
						// 	),
						// },
					]}
				/> */}

				<MessageGroup messages={[message('remaining-blog-posts', <BlogPostList />)]} />

				<MessageGroup
					messages={[
						{
							key: 'location',
							content: (
								<div className="relative h-[150px] w-[300px]">
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

									<span className="absolute top-1/2 left-1/2 z-10 -mt-7 -ml-7 block size-14 animate-[ping_2s_cubic-bezier(0,_0,_0.2,_1)_infinite] rounded-full bg-lime-500" />

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
									Currently in{' '}
									<Link
										href={`https://maps.apple.com/?q=${lanyard.kv.location}`}
										className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
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
								<div className="max-w-[384px] px-4 py-2.5">I'm on a few social platforms</div>
							),
						},
						{
							key: 'discord',
							content: (
								<div className="px-4 py-2.5">
									My Discord is{' '}
									<a
										href="discord://-/users/268798547439255572"
										className="font-serif text-indigo-600 italic underline dark:text-indigo-300"
									>
										@alistaiir
									</a>{' '}
									- I'm currently{' '}
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
							key: 'github',
							content: (
								<div className="px-4 py-2.5">
									I'm{' '}
									<Link
										href="https://github.com/alii"
										className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
										target="_blank"
									>
										@alii on GitHub
									</Link>{' '}
									<SiGithub className="mb-[3px] inline" />{' '}
								</div>
							),
						},
						{
							key: 'chat-2',
							content: (
								<div className="px-4 py-2.5">
									Otherwise, I'm <CiTwitter className="mb-[3px] inline" />{' '}
									<Link
										href="https://x.com/alistaiir"
										className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
										target="_blank"
									>
										@alistaiir on Twitter/X
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
										className="underline decoration-zinc-400 dark:decoration-zinc-500/80"
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
