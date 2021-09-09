import React from 'react';
import useLanyard from 'use-lanyard';
import {SiSpotify} from 'react-icons/si';

export function Song() {
	const {data: user} = useLanyard('268798547439255572');

	if (!user || !user.spotify) {
		return (
			<p>
				Not Playing anything <SiSpotify />
			</p>
		);
	}

	return (
		<a
			target="_blank"
			rel="noreferrer"
			className="inline-flex items-center space-x-2 no-underline opacity-50 hover:opacity-100 py-4"
			href={`https://open.spotify.com/track/${user.spotify.track_id}`}
		>
			<span>
				Listening to {user.spotify.song} by {user.spotify.artist}
			</span>
			<span>
				<SiSpotify />
			</span>
		</a>
	);
}
