import React, {StrictMode, useEffect} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {AnimatePresence, motion} from 'framer-motion';
import {animations} from '../core/animations';
import {useLastFM} from 'use-last-fm';
import {Consts} from '../core/consts';
import {initialBackground} from '../core/data';
import {toBackground} from '../core/utilities';

import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import '../styles/global.css';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import {Router} from 'next/router';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const appHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

export default function App({Component, pageProps, router}: AppProps) {
  const lastFm = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);

  useEffect(() => {
    const url = lastFm.status === 'playing' ? lastFm.song.art : initialBackground;

    document.body.style.background = toBackground(url);
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
  }, [lastFm.song?.art, lastFm.status]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    void new Audio('/pop.mp3').play().catch(() => null);
  }, [router.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    appHeight();

    window.addEventListener('resize', appHeight);
    return () => window.removeEventListener('resize', appHeight);
  }, []);

  return (
    <StrictMode>
      <Head>
        <title>Alistair Smith</title>
      </Head>

      <AnimatePresence>
        <motion.div
          key={router.pathname}
          {...animations}
          className="absolute left-4 right-4 top-4 bottom-4 md:left-10 md:right-10 md:top-10 md:bottom-10"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </StrictMode>
  );
}
