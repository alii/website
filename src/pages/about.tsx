import Image from 'next/image';
import Banner from '../../public/banner.jpg';
import {GetStaticProps} from 'next';
import {LastFM, TopTrack} from '../server/last-fm';
import {LAST_FM_API_KEY, LAST_FM_USERNAME} from '../server/constants';
import {rand} from '../util/types';

interface Props {
	topTracks: TopTrack[];
}

export default function AboutPage({topTracks}: Props) {
	const randomTrack = rand(topTracks);

	return (
		<div className="space-y-8">
			<h1 className="block text-3xl sm:text-4xl md:text-6xl font-bold">
				About
			</h1>
			<div className="text-white text-opacity-20 hover:text-opacity-100 transition-all">
				<Image
					alt="Some friends and I in London"
					src={Banner}
					width={1000}
					height={400}
					placeholder="blur"
					className="block object-cover rounded-xl border-2 border-white"
				/>
				<span className="text-sm not-sr-only">
					a trip to london with some friends
				</span>
			</div>

			<div className="space-y-8 text-neutral-300">
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

				<p>
					I listen to a lot of music, in fact over the last 12 months, I've
					streamed the song {randomTrack.name} by {randomTrack.artist.name}{' '}
					exactly {randomTrack.playcount} times!
				</p>

				<p>
					Below you can find an up-to-date collection of my favourite songs from
					the past year, including how many times I've played each one.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				{topTracks.map(track => {
					const foundImage = track.image.find(image => image.size === 'large');

					if (!foundImage) {
						return null;
					}

					const image = foundImage['#text'];

					return (
						<div key={track.url}>
							<div className="w-full">
								<Image
									src={image}
									alt={`Album cover art for ${track.name} by ${track.artist.name}`}
									width={400}
									height={400}
								/>
							</div>

							<h2>{track.name}</h2>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const api = new LastFM(LAST_FM_API_KEY);
	const topTracks = await api.getTopTracks(LAST_FM_USERNAME, '12month');

	return {
		props: {topTracks},
		revalidate: 120,
	};
};
