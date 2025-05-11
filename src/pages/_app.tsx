import '../globals.css';

import {GoogleAnalytics} from '@next/third-parties/google';
import {Lenis} from 'lenis/react';
import type {AppProps} from 'next/app';
import {Inter, Newsreader} from 'next/font/google';
import Head from 'next/head';
import {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {useFirstEverLoad, useVisitCounts} from '../hooks/use-first-ever-load';

const serif = Newsreader({
	subsets: ['latin'],
	weight: ['400'],
	style: 'italic',
	// fallback: ['serif'],
});

const body = Inter({
	subsets: ['latin'],
});

const tag = process.env.NEXT_PUBLIC_GTM_ID;

export default function App({Component, pageProps}: AppProps) {
	useFirstEverLoad();

	const [, set] = useVisitCounts();

	useEffect(() => {
		set(x => x + 1);
	}, [set]);

	return (
		<>
			<style jsx global>
				{`
					:root {
						--font-serif: ${serif.style.fontFamily};
						--font-sans: ${body.style.fontFamily};
					}
				`}
			</style>

			<Head>
				<title>Alistair Smith</title>
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Lenis root>
				<Component {...pageProps} />
			</Lenis>

			<Toaster />

			{tag && <GoogleAnalytics gaId={tag} />}
		</>
	);
}
