import '../globals.css';

import {GoogleAnalytics} from '@next/third-parties/google';
import {Lenis} from 'lenis/react';
import type {AppProps} from 'next/app';
import {Inter, JetBrains_Mono, Newsreader} from 'next/font/google';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {useFirstEverLoad, useVisitCounts} from '../hooks/use-first-ever-load';

const mono = JetBrains_Mono({
	subsets: ['latin'],
});

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

	const path = useRouter().asPath;

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

			<Lenis root key={path}>
				<Component {...pageProps} />
			</Lenis>

			<Toaster />

			{tag && <GoogleAnalytics gaId={tag} />}
		</>
	);
}
