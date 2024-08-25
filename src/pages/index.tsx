import dayjs from 'dayjs';
import {motion} from 'framer-motion';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {SiSpotify} from 'react-icons/si';
import {useLanyardWS, type Data as LanyardData} from 'use-lanyard';
import album from '../../public/album.png';
import benny from '../../public/benny.png';
import {MessageGroup} from '../components/message';
import {getRecentBlogPosts, type PartialBlogPost} from '../server/blog';
import {env} from '../server/env';
import {getLanyard} from '../server/lanyard';
import {discordId} from '../utils/constants';
import {UKTimeFormatter} from '../utils/constants';
import dynamic from 'next/dynamic';

const DynamicStats = dynamic(() => import('../components/stats').then(mod => mod.Stats), {
  ssr: false
});

// Add this function at the top of the file, outside of the component
function getTimeOfDayMessage(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return "i'm probably having my coffee and getting ready for the day. 🌅";
  } else if (hour >= 12 && hour < 17) {
    return "i'm likely in the middle of my workday, or working out. 🌞";
  } else if (hour >= 17 && hour < 21) {
    return "i might be wrapping up work or enjoying some downtime. 🌇";
  } else {
    return "it's nighttime here. i'm either winding down for the day or up late working on a project. 🌙";
  }
}

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

	const currentHour = new Date().getHours();
	const timeOfDayMessage = getTimeOfDayMessage(currentHour);

	return (
		<main className="mx-auto max-w-xl px-3 pb-16 pt-24">
			<motion.ul
				transition={{
					staggerChildren: 0.3,
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
								<>
									👋 hi there, i'm <strong>cole</strong>. i'm an engineering student at the university of guelph. 📚
								</>
							),
						},
						{
							key: 'karrierone',
							content: (
								<>
									currently i'm working with{' '}
									<Link
										target="_blank"
										href="https://karrier.one/"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
									>
										karrier one
									</Link>
									. we use blockchain technology to decentralize telecommunications. 📡
								</>
							),
						},
						{
							key: 'gambit',
							content: (
								<>
									i'm also working with{' '}
									<Link
										target="_blank"
										href="https://gambitco.io/"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
									>
										gambit technologies
									</Link>
									. we create lifelike ai that captivates customers. 🤖
								</>
							),
						},
					]}
				/>

<MessageGroup
					messages={[
						{
							key: 'blog-link',
							content: (
								<>
									✍️ interested in my thoughts and experiences? check out my{' '}
									<Link
										href="/blog"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
									>
										blog
									</Link>
									, where i write about anything and everything.
								</>
							),
						},
					]}
				/>


				<MessageGroup
					messages={[
						...(lanyard.spotify
							? [
									{
										key: 'music',
										content: (
											<div className="space-y-3">
												<p>
													💿 i listen to a lot of music. i'm currently listening to this on spotify:
												</p>

												<Link
													href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
													className="group relative !mb-1 block w-fit min-w-[300px] overflow-hidden rounded-xl rounded-bl-md p-3"
													target="_blank"
												>
													<div className="absolute -inset-[1px] z-20 rounded-xl rounded-bl-md border-[3px] border-black/10 dark:border-white/20"></div>

													<div className="absolute inset-0">
														<div className="absolute inset-0 z-10 bg-white/70 group-hover:bg-white/80 dark:bg-neutral-800/80 dark:group-hover:bg-neutral-800/90"></div>
														<img
															src={lanyard.spotify.album_art_url ?? album.src}
															alt="Album art"
															aria-hidden
															className="absolute top-1/2 -translate-y-1/2 scale-[3] blur-3xl saturate-[15] dark:saturate-[10]"
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
											</div>
										),
									},
								]
							: [
									{
										key: 'music',
										content: (
											<p>
												💿 i listen to a lot of music. if you come 
												back to this page later, you might see what i'm listening to on spotify, in
												realtime.
											</p>
										),
									},
								]),
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'not-music',
							content: (
								<>
									in the rare case i'm not listening to anything, you can usually find me working out,
									relaxing in the sauna, or playing with my dog. {' '}
								</>
							),
						},
						{
							key: 'benny-photo',
							content: (
								<>
									<div className="mt-2 flex justify-center">
										<img
											src={benny.src}
											alt="Benny, my Shiba Inu"
											className="rounded-lg shadow-md w-64 h-auto"
										/>
									</div>
									<p className="mt-2 text-left text-sm">
										meet benny!
									</p>
								</>
							),
						},
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'location-caption',
							content: (
								<p>
									📍 right now, i'm in 
									south korea, but i will be back in canada soon. 🇰🇷
								</p>
							),
						},
						{
							key: 'local-time',
							content: (
								<p>
									the current time for me is{' '}
									<span className="font-semibold">
										{UKTimeFormatter.format(new Date())}
									</span>
									. <span>{timeOfDayMessage.toLowerCase()}</span>
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
								<>
									💬 want to reach out to me? i'd love to chat.
								</>
							),
						},
						{
							key: 'discord',
							content: (
								<>
									my discord is <code>@snoooozle</code> - i'm currently{' '}
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
												dnd: 'on dnd',
												idle: 'idle',
												online: 'online',
												offline: 'offline',
											}[status]
										}
									</span>
								</>
							),
						},
						{
							key: 'chat-2',
							content: (
								<>
									otherwise, i'm available on{' '}
									<Link
										href="https://x.com/maykessj"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
										target="_blank"
									>
										twitter/x
									</Link>
									.
								</>
							),
						},
						{
							key: 'chat-3',
							content: (
								<>
									also, i'd love to connect on {' '}
									<Link
										href="https://www.linkedin.com/in/colemayke/"
										className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
										target="_blank"
									>
										linkedin.
									</Link>
								</>
							),
						},
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'finally',
							content: (
								<>
									thanks for visiting my website! 🙏 
								</>
							),
						},
					]}
				/>

				<MessageGroup
					messages={[
						{
							key: 'stats',
							content: (
								<>
									<DynamicStats />
								</>
							),
						},
					]}
				/>
			</motion.ul>
		</main>
	);
}