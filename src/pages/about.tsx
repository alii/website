import Image from 'next/image';
import Banner from '../../public/banner.jpg';
import {GetStaticProps} from 'next';
import {
	LAST_FM_API_KEY,
	REDIS_URL,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REDIS_KEYS,
} from '../server/constants';
import SpotifyWebAPI from 'spotify-web-api-node';
import {MdExplicit} from 'react-icons/md';
import {Modal} from '../components/modal';
import {useState} from 'react';
import {SiSpotify} from 'react-icons/si';
import {HiExternalLink} from 'react-icons/hi';
import dayjs from 'dayjs';
import ms from 'ms';
import relativeTime from 'dayjs/plugin/relativeTime';
import IORedis from 'ioredis';
import {LastFM, LastFMGetTrack} from '../server/last-fm';
import {rand} from '../util/types';
import {Details} from '../components/details';
import TrackObjectFull = SpotifyApi.TrackObjectFull;
import AlbumObjectFull = SpotifyApi.AlbumObjectFull;

dayjs.extend(relativeTime);

type Props = {
	topTracks: TrackObjectFull[];
	randomLastFMTrack: LastFMGetTrack;
};

export default function AboutPage({topTracks, randomLastFMTrack}: Props) {
	return (
		<div className="space-y-8">
			<h1 className="block text-3xl font-bold sm:text-4xl md:text-6xl">
				About
			</h1>
			<div className="text-gray-900/30 transition-all hover:text-gray-900 dark:text-white/20 dark:hover:text-white/100">
				<Image
					alt="Some friends and I in London"
					src={Banner}
					width={1000}
					height={400}
					placeholder="blur"
					className="block rounded-xl border-2 border-white object-cover"
				/>
				<span className="not-sr-only text-sm">
					a trip to london with some friends
				</span>
			</div>

			<div className="space-y-8">
				<p>
					Yo! I'm a full-stack engineer from the United Kingdom. I care about
					performant, accessible code. I'm a huge fan of making, reading and
					contributing to open source &amp; you can{' '}
					<a
						href="https://github.com/sponsors/alii"
						rel="noreferrer"
						target="_blank"
					>
						sponsor me on GitHub
					</a>
					. Programming since seven, I've learned a lot about core programming
					principles, scaling, and systems architecture. I always love to joke
					around and I take my{' '}
					<a href="https://twitter.com/alistaiiiir">Twitter</a> presence very
					seriously...
				</p>

				<h2 className="text-3xl font-bold">Music</h2>

				<p>
					I listen to a lot of Spotify and have always had a passion for music
					ever since I was young. Over the last 12 months, I've played the song{' '}
					<span className="font-bold">{randomLastFMTrack.name}</span> by{' '}
					<span className="font-bold">{randomLastFMTrack.artist.name}</span>{' '}
					exactly{' '}
					<span className="font-bold">{randomLastFMTrack.playcount}</span>{' '}
					times! Below you can find an up-to-date collection of my favourite
					songs from the past ~4 weeks.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 gap-y-8 md:grid-cols-3">
				{topTracks.map(track => (
					<Track key={track.id} track={track} />
				))}
			</div>
		</div>
	);
}

function Track({track}: {track: TrackObjectFull}) {
	const [statsOpen, setStatsOpen] = useState(false);

	const image = track.album.images[0].url;
	const artists = track.artists.map(artist => artist.name).join(', ');

	const close = () => {
		setStatsOpen(false);
	};

	const open = () => {
		setStatsOpen(true);
	};

	const album = track.album as AlbumObjectFull;

	return (
		<button
			key={track.id}
			type="button"
			className="group flex flex-col space-y-2 text-left align-top no-underline outline-none focus:outline-none focus:ring focus:ring-offset-4 dark:focus:ring-offset-gray-900"
			aria-roledescription="Opens a stats modal"
			onClick={open}
		>
			<Modal
				isOpen={statsOpen}
				setIsOpen={close}
				title={<SiSpotify size={24} />}
			>
				<div className="space-y-4">
					<div className="relative aspect-[3/1]">
						<Image
							src={image}
							layout="fill"
							alt={`Album cover art of ${track.album.name} by ${artists}`}
							className="rounded-md object-cover"
						/>
					</div>

					<a
						href={track.external_urls.spotify}
						className="group flex justify-between rounded-md border bg-gray-100 p-3 no-underline dark:border-0 dark:bg-gray-900"
						target="_blank"
						rel="noreferrer"
					>
						<div>
							<h2 className="text-2xl font-bold group-hover:underline">
								{track.name}
							</h2>
							<h3 className="text-sm italic text-gray-400">By {artists}</h3>
						</div>

						<div>
							<HiExternalLink size={24} />
						</div>
					</a>

					<div>
						<Details
							details={[
								{
									name: 'Released:',
									value: (
										<span>
											{dayjs(album.release_date).fromNow()} (
											{dayjs(album.release_date).format('DD MMM YYYY')})
										</span>
									),
								},
								{
									name: 'Album:',
									value: album.name,
								},
								{
									name: 'Duration:',
									value: ms(track.duration_ms, {long: true}),
								},
							]}
						/>
					</div>
				</div>
			</Modal>

			<div className="image-span-block w-full overflow-hidden rounded-md">
				<Image
					src={image}
					className="rounded-md brightness-75 transition-all duration-300 group-hover:scale-110 group-hover:brightness-100"
					alt={`Album cover art for ${track.name} by ${artists}`}
					width={400}
					height={400}
				/>
			</div>

			<h2 className="py-0.5 text-lg">
				<span className="font-bold">
					{track.explicit && <MdExplicit className="-mt-1 inline" />}{' '}
					{track.name}
				</span>{' '}
				<span className="text-neutral-700 dark:text-neutral-400">
					• {artists}
				</span>
			</h2>
		</button>
	);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const redis = new IORedis(REDIS_URL);

	const [token, refresh] = await redis.mget(
		SPOTIFY_REDIS_KEYS.AccessToken,
		SPOTIFY_REDIS_KEYS.RefreshToken,
	);

	let api: SpotifyWebAPI;

	if (!token && refresh) {
		// If we don't have a token but we do have a refresh token

		api = new SpotifyWebAPI({
			clientId: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			refreshToken: refresh,
		});

		const result = await api.refreshAccessToken();

		await redis.set(
			SPOTIFY_REDIS_KEYS.AccessToken,
			result.body.access_token,
			'EX',

			// Expires is in seconds as per https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
			result.body.expires_in,
		);

		// If spotify wants us to use a new refresh token, we'll need to update it
		if (result.body.refresh_token) {
			await redis.set(
				SPOTIFY_REDIS_KEYS.RefreshToken,
				result.body.refresh_token,
			);
		}
	} else if (token) {
		api = new SpotifyWebAPI({
			clientId: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			accessToken: token,
		});
	} else {
		throw new Error(
			'No Spotify tokens available! Please manually add them to the Redis store to allow tokens to refresh in the future.',
		);
	}

	const tracks = await api.getMyTopTracks({
		time_range: 'short_term',
	});

	await redis.quit();

	const lfm = new LastFM(LAST_FM_API_KEY);
	const topLFMTracks = await lfm.getTopTracks('aabbccsmith', '12month');

	return {
		props: {
			topTracks: tracks.body.items,
			randomLastFMTrack: rand(topLFMTracks),
		},
		revalidate: 120,
	};
};
