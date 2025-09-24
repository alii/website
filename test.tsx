'use client';

import {Link} from 'bun-framework-react/link';

import {useLanyardWS} from 'use-lanyard';
import {discordId} from './src/utils/constants';

export function Home() {
	const lanyard = useLanyardWS(discordId);

	return (
		<main className="mx-auto max-w-xl px-3 pt-24 pb-16">
			<Link href="/about">About</Link>
			<pre>{JSON.stringify(lanyard, null, 2)}</pre>
		</main>
	);
}
