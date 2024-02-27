import {useState} from 'react';

function parseTitleAndArtist(title: string, artist: string) {
	if (artist === '') {
		const [actualTitle, actualArtist] = title.split('-');

		if (actualTitle && actualArtist) {
			return {
				title: actualTitle.trim(),
				artist: actualArtist.trim(),
			};
		}
	}

	return {
		title,
		artist,
	};
}

export default function RekordboxHistoryParser() {
	const [state, setState] = useState('');

	const result = state
		.split('\n')
		.map(l => l.split('\t'))
		.slice(1)
		.map(l => {
			const [, title, artist, album, bpm, time, key] = l as [
				string,
				string,
				string,
				string,
				string,
				string,
				string,
			];

			const {title: actualTitle, artist: actualArtist} = parseTitleAndArtist(title, artist);

			return {
				title: actualTitle,
				artist: actualArtist,
				album,
				bpm,
				time,
				key,
			};
		})
		.map(l => {
			if (l.artist === '') {
				return l.title;
			}

			return `${l.title} - ${l.artist}`;
		})
		.join('\n');

	return (
		<div className="flex space-x-4">
			<textarea value={state} className="bg-neutral-800" onChange={e => setState(e.target.value)} />

			<pre>{result}</pre>
		</div>
	);
}
