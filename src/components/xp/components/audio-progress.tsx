import {useInterval} from 'alistair/hooks';
import {useState} from 'react';

export interface AudioProgressProps {
	start: number;
	end: number;
}

/**
 * Accepts two date timestamps and rerenders every second, showing a progress bar of how far we are between the two timestamps.
 *
 * Called AudioProgress beacuse it is styled like an audio playback bar
 */
export function AudioProgress({start, end}: AudioProgressProps) {
	const [now, setNow] = useState(() => Date.now());

	useInterval(() => {
		setNow(Date.now());
	}, 500);

	return <progress className="w-full" value={now - start} max={end - start} />;
}
