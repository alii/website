import '../globals.css';

import {GoogleAnalytics} from '@next/third-parties/google';
import type {AppProps} from 'next/app';
import localFont from 'next/font/local';
import Head from 'next/head';
import {Toaster} from 'react-hot-toast';

// vendored woff2 (latin subsets of the Google Fonts variable fonts) — the
// Socket Firewall on this machine breaks next/font/google's download in dev,
// so the files live in the repo and no network fetch ever happens
const karla = localFont({
	src: '../fonts/karla-latin.woff2',
	weight: '200 800',
	variable: '--font-karla',
	display: 'swap',
});

const lora = localFont({
	src: '../fonts/lora-latin.woff2',
	weight: '400 700',
	variable: '--font-lora',
	display: 'swap',
});

const iosevka = localFont({
	src: [
		{path: '../fonts/iosevka-latin-400.woff2', weight: '400'},
		{path: '../fonts/iosevka-latin-700.woff2', weight: '700'},
	],
	variable: '--font-iosevka',
	display: 'swap',
});

const tag = process.env.NEXT_PUBLIC_GTM_ID;

export default function App({Component, pageProps}: AppProps) {
	return (
		// next/font can't be used in _document, so the variables live on this
		// wrapper — which means font-sans must be applied HERE, not on <body>,
		// or the var() references won't resolve
		<div className={`${karla.variable} ${lora.variable} ${iosevka.variable} font-sans`}>
			<Head>
				<title>Alistair Smith</title>
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Component {...pageProps} />

			<Toaster />

			{tag && <GoogleAnalytics gaId={tag} />}
		</div>
	);
}
