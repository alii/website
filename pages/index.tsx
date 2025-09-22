'use client';

import {useState} from 'react';

export default function Index() {
	const [bool, set] = useState(false);

	return (
		<main className="mx-auto max-w-xl px-3 pt-24 pb-16">
			<button onClick={() => set(x => !x)}>toggle it</button>
			<pre>{JSON.stringify({bool}, null, 2)}</pre>
		</main>
	);
}
