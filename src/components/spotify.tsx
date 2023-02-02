'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import {HiOutlineExternalLink} from 'react-icons/hi';
import {SiSpotify} from 'react-icons/si';
import {Data} from 'use-lanyard';
import {hoverClassName} from './card';
import {useUpdatingLanyard} from '../hooks/lanyard';

export interface Props {
	lanyard: Data;
}

export function Spotify(props: Props) {
	const {data: lanyard} = useUpdatingLanyard(props.lanyard.discord_user.id, props.lanyard);

	if (!lanyard?.spotify || !lanyard.spotify.album_art_url) {
		return (
			<Link
				href="https://open.spotify.com/playlist/18R9Cntl2PZEaGMLz4cyX2"
				target="_blank"
				rel="noopener noreferrer"
				className={clsx(
					'group relative col-span-2 flex h-52 overflow-hidden rounded-2xl md:col-span-3',
					hoverClassName,
				)}
			>
				<span className="absolute inset-0 -z-10">
					<Image
						src={'https://i.scdn.co/image/ab67706c0000da84e581815a92946c295b02b936'}
						className="bg-black brightness-50"
						fill
						alt="Album cover art"
						style={{objectFit: 'cover'}}
					/>
				</span>

				<span className="flex flex-1 flex-col justify-between p-6 text-white">
					<span className="flex justify-between">
						<SiSpotify className="text-2xl" />
						<HiOutlineExternalLink className="text-xl opacity-50 transition duration-500 group-hover:opacity-100" />
					</span>

					<div className="space-y-0.5">
						<h2 className="font-title font-bold">
							<span className="font-medium">playlist:</span>early travel
						</h2>

						<p className="text-sm">because you had to get a 3 hour bus journey in the early hours</p>
					</div>
				</span>
			</Link>
		);
	}

	return (
		<Link
			key={lanyard.spotify.track_id}
			href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
			target="_blank"
			rel="noopener noreferrer"
			className={clsx('group relative col-span-2 flex h-52 overflow-hidden rounded-2xl md:col-span-3', hoverClassName)}
		>
			<span className="absolute inset-0 -z-10">
				<Image
					src={lanyard.spotify.album_art_url}
					className="bg-black brightness-50 transition-transform group-hover:-rotate-[1deg] group-hover:scale-105"
					fill
					alt="Album cover art"
					style={{objectFit: 'cover'}}
				/>
			</span>

			<span className="flex flex-1 flex-col justify-between p-6 text-white">
				<span className="flex justify-between">
					<SiSpotify className="text-2xl" />
					<HiOutlineExternalLink className="text-xl opacity-50 transition duration-500 group-hover:opacity-100" />
				</span>

				<span>
					<h2>
						<span className="mb-0.5 mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden />{' '}
						Listening to <span className="font-bold">{lanyard.spotify.song}</span> by{' '}
						<span className="font-bold">{lanyard.spotify.artist}</span>.
					</h2>
				</span>
			</span>
		</Link>
	);
}
