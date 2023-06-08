import '../globals.css';

import Lenis from '@studio-freight/lenis';
import type {AppProps} from 'next/app';
import {Nanum_Myeongjo} from 'next/font/google';
import font from 'next/font/local';
import Head from 'next/head';
import {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';

const title = Nanum_Myeongjo({
	subsets: ['latin'],
	weight: '400',
	fallback: ['serif'],
});

const body = font({
	src: '../fonts/roobert-variable.woff2',
});

export default function App({Component, pageProps}: AppProps) {
	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const lenis = new Lenis({
			smoothWheel: true,
		});

		let rendering = true;

		const render = (time: number) => {
			if (!rendering) {
				return;
			}

			lenis.raf(time);

			requestAnimationFrame(render);
		};

		requestAnimationFrame(render);

		return () => {
			lenis.destroy();
			rendering = false;
		};
	}, []);

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
