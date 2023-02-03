import '../globals.css';

import {Inter_Tight, Overpass_Mono} from '@next/font/google';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {Toaster} from 'react-hot-toast';

const title = Overpass_Mono({
	subsets: ['latin'],
	weight: 'variable',
});

const inter = Inter_Tight({
	subsets: ['latin'],
	weight: 'variable',
});

export default function App({Component, pageProps}: AppProps) {
	return (
		<>
			<style jsx global>
				{`
					:root {
						--font-title: ${title.style.fontFamily};
						--font-inter: ${inter.style.fontFamily};
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
