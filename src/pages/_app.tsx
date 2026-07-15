import '../globals.css';

import {GoogleAnalytics} from '@next/third-parties/google';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {Toaster} from 'react-hot-toast';

const tag = process.env.NEXT_PUBLIC_GTM_ID;

export default function App({Component, pageProps}: AppProps) {
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
