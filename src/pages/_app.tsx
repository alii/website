import React, {StrictMode, useEffect} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {AnimatePresence, motion} from 'framer-motion';
import {animations} from '../core/animations';
import {useLastFM} from 'use-last-fm';
import {Consts} from '../core/consts';
import {initialBackground} from '../core/data';
import {toBackground} from '../core/utilities';

import '../styles/global.css';

export default function App({Component, pageProps, router}: AppProps) {
  const lastFm = useLastFM(Consts.LastFMUsername, Consts.LastFMToken);

  useEffect(() => {
    const url = lastFm.status === 'playing' ? lastFm.song.art : initialBackground;
    document.body.style.background = toBackground(url);
  }, [lastFm.song, lastFm.status]);

  return (
    <StrictMode>
      <Head>
        <title>Alistair Smith</title>
      </Head>
      <AnimatePresence exitBeforeEnter>
        <motion.div key={router.pathname} {...animations} id="test" style={{height: '100%'}}>
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </StrictMode>
  );
}
