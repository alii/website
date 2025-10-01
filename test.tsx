'use client';

import {useLanyardWS} from 'use-lanyard';

export function Home() {
	const data = useLanyardWS('268798547439255572');

	return (
		<main className="mx-auto max-w-xl px-3 pt-24 pb-16">
			<h1>Hello 2World23</h1>
			<pre suppressHydrationWarning>{JSON.stringify(data, null, 2)}</pre>
		</main>
	);
}
