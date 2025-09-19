'use client';

import {useLanyardWS} from 'use-lanyard';
import {discordId} from '../src/utils/constants';

export default function Home() {
	const lanyard = useLanyardWS(discordId);

	return (
		<main className="mx-auto max-w-xl px-3 pt-24 pb-16">
			<pre>{JSON.stringify(lanyard, null, 2)}</pre>
		</main>
	);
}
