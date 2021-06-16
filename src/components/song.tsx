import {useLastFM} from 'use-last-fm';
import {Consts} from '../core/consts';
import React, {ReactNode} from 'react';

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
		<div className="glass p-5">
			<a href={lastFM.song.url} className="hover:underline">
				🎸 Listening to <Segment>{lastFM.song.name}</Segment> by <Segment>{lastFM.song.artist}</Segment> on{' '}
				<Segment>Spotify</Segment>
				<Pulse />
			</a>
		</div>
	);
};

const Segment = (props: {children: ReactNode}) => <span className="font-bold">{props.children}</span>;
const Pulse = () => <span className="bg-green-500 h-2 w-2 animate-pulse ml-2 rounded-full inline-block" />;
