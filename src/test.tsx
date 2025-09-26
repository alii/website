'use client';

import {useLocalStorage} from 'alistair/hooks';
import {Link} from 'bun-framework-react/link';
import {useLanyardWS} from 'use-lanyard';

export function Home() {
	const lanyard = useLanyardWS('268798547439255572');

	useLocalStorage('ok', () => null);

	return (
		<main className="mx-auto max-w-xl px-3 pt-24 pb-16">
			<Link href="/about">About</Link>
			<pre>{JSON.stringify(lanyard, null, 2)}</pre>
		</main>
	);
}
