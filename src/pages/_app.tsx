import '../globals.css';

import {GoogleAnalytics} from '@next/third-parties/google';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {useFirstEverLoad, useVisitCounts} from '../hooks/use-first-ever-load';

const tag = process.env.NEXT_PUBLIC_GTM_ID;

if (typeof CSS !== 'undefined' && 'paintWorklet' in CSS) {
	(CSS as {} as {paintWorklet: Worklet}).paintWorklet.addModule(
		'https://unpkg.com/houdini-paint-dot-grid/dist/dot-grid-worklet.js',
	);
}

export default function App({Component, pageProps}: AppProps) {
	useFirstEverLoad();

	const [_, set] = useVisitCounts();

	useEffect(() => {
		set(x => x + 1);
	}, [set]);

	return (
		<>
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
