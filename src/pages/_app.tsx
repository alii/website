import React, {StrictMode, useEffect, useState} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import Image from "next/image";
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

const appHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

export default function App({Component, pageProps, router}: AppProps) {
  const lastFm = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);
  const [url, setURL] = useState(initialBackground);

  useEffect(() => {
    if (lastFm.status === "playing") setURL(lastFm.song.art);
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
        <Image className="bg" src={url} alt="" layout="fill" objectFit="cover" />
      <AnimatePresence>
        <motion.div
          key={router.pathname}
          {...animations}
          className="absolute left-4 right-4 top-4 bottom-4 md:left-10 md:right-10 md:top-10 md:bottom-10"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
      <style jsx global>{`
        body {
          background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1))
        }
        
        .bg {
          z-index: -1;
        }
      `}</style>
    </StrictMode>
  );
}
