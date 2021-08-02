import {useLastFM} from 'use-last-fm';
import {Consts} from '../core/consts';
import React, {ReactNode} from 'react';
import {Tooltip} from 'react-tippy';
import Image from 'next/image';

export const Song = () => {
	const lastFM = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);

	if (lastFM.status !== 'playing') {
		return (
			<div className="glass p-5">
				<p>Not listening to anything... 😞</p>
			</div>
		);
	}

	return (
		<Tooltip className="glass px-3 py-1" title="The album cover is the background on the site">
			<a href={lastFM.song.url} className="hover:underline hover:text-white flex items-center">
				<span>
					<Pulse />
					Listening to <Segment>{lastFM.song.name}</Segment> by <Segment>{lastFM.song.artist}</Segment> on{' '}
					<Segment>Spotify</Segment>
				</span>
				<span className="flex-1 justify-end flex">
					<Image className="rounded-full" src={lastFM.song.art} height={32} width={32} alt="Album Cover" />
				</span>
			</a>
		</Tooltip>
	);
};

const Segment = (props: {children: ReactNode}) => <span className="font-bold">{props.children}</span>;
const Pulse = () => <span className="bg-green-500 h-2 w-2 animate-pulse mr-2 rounded-full inline-block" />;
