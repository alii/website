import dayjs from 'dayjs';
import type {GetStaticProps} from 'next';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import SpotifyWebAPI from 'spotify-web-api-js';
import {useLanyardWS, type Data as LanyardData} from 'use-lanyard';
import {AudioProgress} from '../components/xp/components/audio-progress';
import {PosterizedImage} from '../components/xp/components/posterized-image';
import {WindowFrame} from '../components/xp/components/window';
import {getRecentBlogPosts, type PartialBlogPost} from '../server/blog';
import {env} from '../server/env';
import {getLanyard} from '../server/lanyard';
import {getSpotifyRedirectURL, parseAccessTokenFromURL} from '../spotify/config';
import {spotifyQueue} from '../spotify/queue';
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

	// const status = lanyard.discord_status ?? 'offline';

	const yearProgressPercentage = Math.round(
		(dayjs().diff(dayjs().startOf('year'), 'days') / 365) * 100,
	);

	const spotify = lanyard.spotify;

	const [spotifyClient, setSpotifyClient] = useState<SpotifyWebAPI.SpotifyWebApiJs | null>(null);
	const [spotifyError, setSpotifyError] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const accessToken = parseAccessTokenFromURL(window.location.href);

		if (accessToken) {
			// Remove access token from the URL
			history.pushState('', document.title, window.location.pathname + window.location.search);

			const client = new SpotifyWebAPI();
			client.setAccessToken(accessToken);

			setSpotifyClient(client);
		}
	}, []);

	const lastPlayRequest = useRef<string | null>(null);

	useEffect(() => {
		const spotify = lanyard.spotify;
		const client = spotifyClient;

		if (!spotify) {
			if (client) {
				spotifyQueue.addSync(() => client.pause(), {
					onCatch: error => setSpotifyError(error.message),
				});
			}

			return;
		}

		const trackId = spotify.track_id;

		if (!client || !trackId) {
			return;
		}

		spotifyQueue.addSync(
			async () => {
				const playback = await client.getMyCurrentPlaybackState();

				if (!playback.device.id) {
					setSpotifyError('No device found to play music on!');
					return;
				}

				const deviceId = playback.device.id;

				const startTimestamp = spotify.timestamps.start;
				const now = Date.now();

				const timeSinceStart = now - startTimestamp;

				if (lastPlayRequest.current === trackId) {
					return Promise.resolve();
				}

				lastPlayRequest.current = trackId;

				return client.play({
					uris: [`spotify:track:${trackId}`],
					position_ms: timeSinceStart,
					device_id: deviceId,
				});
			},
			{onCatch: error => setSpotifyError(error.message)},
		);
	}, [spotifyClient, lanyard.spotify]);

	return (
		<main>
			<WindowFrame title="About Me">
				<div className="max-w-[280px] space-y-4">
					<p>Hi, I'm Alistair. I am a software engineer.</p>

					<p>
						I an open source enthusiast and I've been called a TypeScript wizard at least a few
						times. I'm interested in things like language specifications and compiler internals.
					</p>

					<PosterizedImage
						amount={10}
						src="/alistair.jpeg"
						className="size-[150px]"
						alt="Alistair"
					/>
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
							target="_blank"
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

			{spotify ? (
				<WindowFrame
					title="Spotify"
					onHelp={() => {
						alert('You can listen along with me on Spotify by clicking the button below');
					}}
				>
					<div className="flex w-[400px] flex-col space-y-4">
						<div className="flex w-full items-center space-x-4">
							<PosterizedImage
								amount={10}
								className="size-16"
								src={spotify.album_art_url ?? '/album.png'}
								alt="Album art"
							/>

							<div className="flex-1 space-y-2 overflow-x-hidden">
								<div className="truncate text-lg font-bold">{spotify.song}</div>
								<h2 className="text-sm">{spotify.artist.split('; ').join(', ')}</h2>
							</div>
						</div>

						<div>
							<AudioProgress start={spotify.timestamps.start} end={spotify.timestamps.end} />
						</div>

						<div className="flex gap-1">
							<button
								onClick={() => {
									if (spotifyClient) {
										spotifyQueue.addSync(() => spotifyClient.pause(), {
											onCatch: error => setSpotifyError(error.message),
										});
									} else {
										window.location.href = getSpotifyRedirectURL();
									}
								}}
							>
								{spotifyClient ? 'Stop listening along' : 'Listen along'}
							</button>
							<button
								onClick={() => {
									window.open(`https://open.spotify.com/track/${spotify.track_id}`, '_blank');
								}}
							>
								Open in Spotify
							</button>
						</div>

						{spotifyError && <p className="font-bold text-red-700">{spotifyError}</p>}
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

			<WindowFrame title="Where am I?">
				<div className="max-w-[380px] space-y-4">
					<div className="relative my-1 h-[150px] w-[300px]">
						<div className="absolute inset-0 overflow-hidden">
							<PosterizedImage
								amount={10}
								src={`/api/map?location=${lanyard.kv.location}&theme=light`}
								alt="Map"
								className="absolute inset-0 h-full w-full scale-125 object-cover dark:hidden"
							/>

							<PosterizedImage
								amount={10}
								src={`/api/map?location=${lanyard.kv.location}&theme=dark`}
								alt="Map"
								className="absolute inset-0 hidden h-full w-full scale-125 object-cover dark:block"
							/>
						</div>

						<PosterizedImage
							amount={10}
							src={`https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.webp?size=160`}
							alt="Avatar"
							className="absolute left-1/2 top-1/2 z-10 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
						/>

						<p className="absolute left-1/2 top-[calc(50%+40px)] -translate-x-1/2 -translate-y-1/2 bg-black/75 text-xs font-bold text-white">
							{lanyard.kv.location}
						</p>
					</div>
				</div>
			</WindowFrame>
		</main>
	);
}
