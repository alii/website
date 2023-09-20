import '../globals.css';

import type {AppProps} from 'next/app';
import {Newsreader} from 'next/font/google';
import font from 'next/font/local';
import Head from 'next/head';
import {Toaster} from 'react-hot-toast';

const title = Newsreader({
	subsets: ['latin'],
	weight: ['400', '200'],
	style: 'italic',
	fallback: ['serif'],
});

const body = font({
	src: '../fonts/roobert-variable.woff2',
});

export default function App({Component, pageProps}: AppProps) {
	return (
		<>
			<style jsx global>
				{`
					:root {
						--font-title: ${title.style.fontFamily};
						--font-body: ${body.style.fontFamily};
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
		</>
	);
}
