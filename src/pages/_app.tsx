import React, {StrictMode, useEffect} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {AnimatePresence, motion} from 'framer-motion';
import {animations} from '../core/animations';
import {useLastFM} from 'use-last-fm';
import {Consts} from '../core/consts';
import {initialBackground} from '../core/data';
import {toBackground} from '../core/utilities';

import 'tailwindcss/tailwind.css';
import '../styles/global.css';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import {Router} from 'next/router';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({Component, pageProps, router}: AppProps) {
  const lastFm = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);

  useEffect(() => {
    const url = lastFm.status === 'playing' ? lastFm.song.art : initialBackground;
    document.body.style.background = toBackground(url);
    document.body.style.backgroundSize = 'cover';
  }, [lastFm.song?.art, lastFm.status]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    void new Audio('/pop.mp3').play();
  }, [router.pathname]);

  return (
    <StrictMode>
      <Head>
        <title>Alistair Smith</title>
      </Head>
      <div className="h-full bg-blur">
        <AnimatePresence exitBeforeEnter>
          <motion.div key={router.pathname} {...animations} className="h-full">
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </StrictMode>
  );
}
