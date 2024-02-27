import {useState} from 'react';

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

			return {
				title,
				artist,
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
