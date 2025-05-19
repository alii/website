import '../globals.css';

import {GoogleAnalytics} from '@next/third-parties/google';
import type {AppProps} from 'next/app';
import {Inter, JetBrains_Mono, Newsreader} from 'next/font/google';
import Head from 'next/head';
import {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {useShouldDoInitialPageAnimations} from '../hooks/use-did-initial-page-animations';
import {useFirstEverLoad, useVisitCounts} from '../hooks/use-first-ever-load';

const mono = JetBrains_Mono({
	subsets: ['latin'],
});

const serif = Newsreader({
	subsets: ['latin'],
	style: 'italic',
});

const body = Inter({subsets: ['latin']});

const tag = process.env.NEXT_PUBLIC_GTM_ID;

export default function App({Component, pageProps}: AppProps) {
	useFirstEverLoad();
	useShouldDoInitialPageAnimations();

	const [, set] = useVisitCounts();

	useEffect(() => {
		set(x => x + 1);
	}, [set]);

	return (
		<>
			<style jsx global>
				{`
					:root {
						--next-font-serif: ${serif.style.fontFamily};
						--next-font-sans: ${body.style.fontFamily};
						--next-font-mono: ${mono.style.fontFamily};
					}
				`}
			</style>

			<Head>
				<title>Alistair Smith</title>
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Component {...pageProps} />

			<Toaster />

			{tag && <GoogleAnalytics gaId={tag} />}
		</>
	);
}
