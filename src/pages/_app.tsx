import React, {StrictMode, useEffect, useRef} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {Router} from 'next/router';
import NProgress from 'nprogress';

import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import 'nprogress/nprogress.css';
import {loadCursor} from '../util/cursor';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({Component, pageProps, router}: AppProps) {
	const ballCanvas = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === 'undefined' || !ballCanvas.current) {
			return;
		}

		return loadCursor(ballCanvas.current);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		void new Audio('/pop.mp3').play().catch(() => null);
	}, [router.pathname]);

	return (
		<StrictMode>
			<Head>
				<title>Alistair Smith</title>
			</Head>
			<Component {...pageProps} />
			<div
				ref={ballCanvas}
				className="opacity-0 fixed ball-transitions duration-200 pointer-events-none z-30 h-3 w-3 bg-white rounded-full shadow-md"
			/>
		</StrictMode>
	);
}
