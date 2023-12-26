import clsx from 'clsx';
import dayjs from 'dayjs';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {FiArrowUpRight} from 'react-icons/fi';
import {
	SiAmazonaws,
	SiBabel,
	SiDiscord,
	SiDocker,
	SiGit,
	SiGithub,
	SiGo,
	SiJavascript,
	SiMongodb,
	SiNextdotjs,
	SiNodedotjs,
	SiPostgresql,
	SiReact,
	SiRedis,
	SiSpotify,
	SiTailwindcss,
	SiTypescript,
	SiVisualstudiocode,
	SiWebpack,
	SiWebstorm,
	SiX,
	SiYarn,
} from 'react-icons/si';
import {useLanyardWS, type Data} from 'use-lanyard';
import {ContactForm} from '../components/contact-form';
import {CardHoverEffect, hoverClassName} from '../components/hover-card';
import {Time} from '../components/time';
import matrix from '../images/matrix.gif';
import me from '../images/me.jpg';
import {getMapURL} from '../server/apple-maps';
import {getRecentBlogPosts, type PartialBlogPost} from '../server/blog';
import {env} from '../server/env';
import {getLanyard} from '../server/lanyard';
import {age, discordId} from '../utils/constants';
import {formatList} from '../utils/lists';

export interface Props {
	lanyard: Data;
	map: string;
	location: string;
	recentBlogPosts: PartialBlogPost[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const lanyard = await getLanyard(discordId);
	const location = lanyard.kv.location ?? env.DEFAULT_LOCATION;

	const map = getMapURL(location);

	const allBlogPosts = await getRecentBlogPosts();
	const recentBlogPosts = allBlogPosts
		.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
		.slice(0, 3);

	return {
		revalidate: 10,
		props: {
			map,
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
		<main className="mx-auto grid max-w-3xl grid-cols-6 gap-6 px-6 pb-40 pt-16">
			<div className="col-span-4 flex h-52 flex-col justify-between overflow-hidden rounded-2xl bg-pink-200 px-8 py-8 dark:border-pink-500 dark:bg-pink-500/20 dark:shadow-none dark:backdrop-blur-2xl md:col-span-4">
				<div className="flex">
					<Link
						className="flex items-center justify-center space-x-1.5 rounded-full bg-pink-300 px-2 py-0.5 font-title dark:bg-pink-500/25"
						href="https://alistair.blog"
						target="_blank"
						rel="noopener noreferrer"
					>
						<span>writing</span>
						<span>
							<FiArrowUpRight />
						</span>
					</Link>
				</div>

				<div className="space-y-4">
					<div>
						<h1 className="text-xl text-pink-900 dark:text-pink-300 dark:text-glow-pink-500/50">
							Alistair Smith
						</h1>

						<p className="text-pink-600 dark:text-pink-300/80 dark:text-glow-pink-500/50">
							{age} y/o full stack typescript engineer
						</p>
					</div>
				</div>
			</div>

			<CardHoverEffect className="col-span-2 h-full">
				<Link
					href="https://twitter.com/alistaiir"
					target="_blank"
					rel="noopener noreferrer"
					className={clsx(
						'flex h-full items-center justify-center rounded-2xl bg-neutral-200 text-4xl text-black dark:bg-neutral-800 dark:text-white',
						hoverClassName,
					)}
				>
					<span className="sr-only">Twitter</span>
					<span className="transform-gpu transition duration-500 group-hover:scale-[1.3]">
						<SiX />
					</span>
				</Link>
			</CardHoverEffect>

			<div
				className={clsx(
					'col-span-3 flex h-52 items-center justify-center rounded-2xl text-4xl md:col-span-2',
					{
						online: 'bg-green-400 text-green-900 dark:bg-green-600 dark:text-green-50',
						idle: 'bg-orange-400 text-orange-50 ',
						dnd: 'bg-red-500 text-red-100 dark:bg-red-600',
						offline: 'bg-blurple text-white/90',
					}[status],
				)}
			>
				<div className="-rotate-[4deg] scale-[1] space-y-1 text-center md:scale-[1.2]">
					<h2>
						<SiDiscord className="inline" /> <span>{status}</span>
					</h2>

					<p className="text-base">
						<span>@{lanyard.discord_user.username}</span>
					</p>
				</div>
			</div>

			<Time />

			<CardHoverEffect className="col-span-3 h-full md:col-span-3">
				<Link
					href="https://github.com/alii"
					target="_blank"
					rel="noopener noreferrer"
					className={clsx(
						'group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl text-white',
						hoverClassName,
					)}
				>
					<span aria-hidden className="pointer-events-none absolute inset-0 -z-20">
						<img
							src={matrix.src}
							alt="The Matrix scrolling characters effect"
							className="absolute inset-0 h-full w-full object-cover object-center invert dark:brightness-[0.7] dark:invert-0"
						/>

						<span
							aria-hidden
							className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-neutral-900/20 dark:bg-neutral-900/50"
						/>
					</span>

					<span aria-hidden className="px-6 pt-6">
						<span className="flex justify-between">
							<SiGithub className="text-3xl" />
							<FiArrowUpRight className="text-xl opacity-50 transition duration-500 group-hover:opacity-100" />
						</span>
					</span>

					<span className="space-y-0.5 px-6 pb-6">
						<span className="block font-semibold">GitHub</span>

						<span className="block text-sm">My open source work &amp; contributions.</span>
					</span>
				</Link>
			</CardHoverEffect>

			<CardHoverEffect className="col-span-3 h-52">
				{!lanyard?.spotify || !lanyard.spotify.album_art_url ? (
					<Link
						href="https://open.spotify.com/playlist/15bl4PuutD4aS2GVsJGUk9"
						target="_blank"
						rel="noopener noreferrer"
						className={clsx(
							'group relative flex h-full overflow-hidden rounded-2xl',
							hoverClassName,
						)}
					>
						<span className="absolute inset-0 -z-10">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src="https://i.scdn.co/image/ab67706c0000da84a15b50aca103257f2c7f4797"
								className="absolute inset-0 h-full w-full bg-black object-cover object-center brightness-50"
								alt="Album cover art"
							/>
						</span>

						<span className="flex flex-1 flex-col justify-between p-6 text-white">
							<span className="flex justify-between">
								<SiSpotify className="text-2xl" />
								<FiArrowUpRight className="text-xl opacity-50 transition duration-500 group-hover:opacity-100" />
							</span>

							<div className="space-y-0.5">
								<h2 className="font-title font-bold">
									<span className="font-medium">playlist:</span> bedtime dnb
								</h2>

								<p className="text-sm">Drum and bass to send you to sleep, or host afters with.</p>
							</div>
						</span>
					</Link>
				) : (
					<Link
						href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
						target="_blank"
						rel="noopener noreferrer"
						className={clsx(
							'group relative flex h-full overflow-hidden rounded-2xl',
							hoverClassName,
						)}
					>
						<span className="absolute inset-0 -z-10">
							<img
								src={lanyard.spotify.album_art_url}
								className="absolute inset-0 h-full w-full scale-[1.15] bg-black object-cover object-center brightness-50 transition-all duration-500 will-change-[transform,_filter] group-hover:scale-[1.35] group-hover:brightness-[0.4]"
								alt="Album cover art"
							/>
						</span>

						<span className="flex flex-1 flex-col justify-between p-6 text-white">
							<span className="flex justify-between">
								<SiSpotify className="text-2xl" />
								<FiArrowUpRight className="text-xl opacity-50 transition duration-500 group-hover:opacity-100" />
							</span>

							<span>
								<h2>
									<span
										className="mb-0.5 mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"
										aria-hidden
									/>{' '}
									Listening to{' '}
									<span className="font-bold" suppressHydrationWarning>
										{lanyard.spotify.song}
									</span>{' '}
									by{' '}
									<span className="font-bold" suppressHydrationWarning>
										{formatList(lanyard.spotify.artist.split('; '), 'conjunction')}
									</span>
									.
								</h2>
							</span>
						</span>
					</Link>
				)}
			</CardHoverEffect>

			<div className="group relative col-span-3 flex h-full min-h-[13rem] flex-shrink-0 overflow-hidden rounded-2xl">
				<img
					src={props.map}
					className="absolute inset-0 h-full w-full scale-[1.25] bg-black object-cover object-center"
					alt="A map locating roughly where I am right now"
				/>

				<div className="absolute left-1/2 top-1/2 z-10 flex w-full flex-shrink-0 -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-2">
					<div aria-hidden className="absolute translate-y-[14px]">
						<span className="block h-12 w-12 animate-ping rounded-full bg-lime-500 duration-1000" />
					</div>

					<img
						src={me.src}
						alt="Photo of me above a map of my current location"
						height={60}
						width={60}
						className="h-15 w-15 z-20 rounded-full border-2 border-black transition-transform duration-500 group-hover:-rotate-[10deg] group-hover:scale-110"
					/>

					<p className="rounded-full bg-white/10 pl-2.5 pr-3 font-bold text-white/95 backdrop-blur-md">
						📍 {props.location}
					</p>
				</div>
			</div>

			<div className="col-span-3 flex items-center justify-center rounded-2xl bg-fuchsia-700 p-6 text-fuchsia-100 md:col-span-2">
				<div className="grid w-full grid-cols-4 grid-rows-4 gap-4 [&>svg]:w-full [&>svg]:text-center">
					<SiTypescript size={24} />
					<SiDocker size={24} />
					<SiNextdotjs size={24} />
					<SiRedis size={24} />
					<SiPostgresql size={24} />
					<SiReact size={24} />
					<SiTailwindcss size={24} />
					<SiNodedotjs size={24} />
					<SiGo size={24} />
					<SiJavascript size={24} />
					<SiAmazonaws size={24} />
					<SiWebstorm size={24} />
					<SiWebpack size={24} />
					<SiBabel size={24} />
					<SiYarn size={24} />
					<SiGit size={24} />
					<SiSpotify size={24} />
					<SiMongodb size={24} />
					<SiVisualstudiocode size={24} />
					<SiDiscord size={24} />
				</div>
			</div>

			<div className="col-span-6 space-y-2 rounded-2xl bg-yellow-200 p-6 dark:bg-indigo-800 md:col-span-4">
				<h2 className="font-semibold">
					Hello world <span className="inline dark:hidden">🌻</span>
					<span className="hidden dark:inline">⭐</span>
				</h2>

				<p>
					My name is Alistair, I'm a software engineer from the United Kingdom. I've been
					programming for as long as I can remember, and I'm currently spending my time with the
					wonderful people at{' '}
					<Link className="underline" href="https://hop.io">
						Hop
					</Link>
					.
				</p>

				<p>
					Beyond programming, I'm really interested in music production and you can often catch me
					spending time messing with DJ decks and my Maschine. Either that or I'll be out riding my
					Boosted Board.
				</p>
			</div>

			<div className="col-span-6 space-y-1 rounded-2xl bg-yellow-500 p-6 text-black md:col-span-6">
				<h1 className="font-semibold text-black/70">
					Recent Blog Posts{' '}
					<span className="text-yellow-800">
						<Link href="https://alistair.blog">— alistair.blog</Link>
					</span>
				</h1>

				<div className="space-y-2 pt-2">
					{props.recentBlogPosts.slice(0, 3).map(post => {
						return (
							<Link
								className="-mx-6 block px-6 py-2 hover:bg-yellow-600/50"
								key={post.slug}
								href={`https://alistair.blog/${post.slug}`}
							>
								<h2 className="text-black">{post.name}</h2>
								<p className="line-clamp-2 text-black/80">{post.excerpt}</p>
							</Link>
						);
					})}
				</div>
			</div>

			<div className="col-span-6 space-y-4 rounded-2xl bg-lime-400 p-6 text-black dark:bg-lime-500 md:col-span-6">
				<ContactForm />
			</div>
		</main>
	);
}
