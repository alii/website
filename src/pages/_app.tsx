import React, {StrictMode, useEffect, useState} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import Image from 'next/image';
import {Router} from 'next/router';
import {AnimatePresence, motion} from 'framer-motion';
import NProgress from 'nprogress';
import {useLastFM} from 'use-last-fm';
import {animations} from '../core/animations';
import {Consts} from '../core/consts';
import {initialBackground} from '../core/data';

import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import 'nprogress/nprogress.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({Component, pageProps, router}: AppProps) {
	const lastFm = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);
	const [url, setURL] = useState(initialBackground);

	useEffect(() => {
		if (lastFm.status === 'playing') {
			setURL(lastFm.song.art);
		}
	}, [lastFm.song?.art, lastFm.status]);

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
			<Image className="bg" src={url} alt="" layout="fill" objectFit="cover" />
			<div className="absolute left-0 right-0 top-0 bottom-0">
				<AnimatePresence>
					<motion.div key={router.pathname} {...animations} className="absolute h-full w-full">
						<Component {...pageProps} />
					</motion.div>
				</AnimatePresence>
			</div>
		</StrictMode>
	);
}
