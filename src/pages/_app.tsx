import '../globals.css';

import type {AppProps} from 'next/app';
import {Inter, Newsreader} from 'next/font/google';
import Head from 'next/head';
import {useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {useFirstEverLoad, useVisitCounts} from '../hooks/use-first-ever-load';
import FadeTransition from '../components/FadeTransition';

const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '200'],
  style: 'italic',
  fallback: ['serif'],
});

const body = Inter({
  subsets: ['latin'],
});

export default function App({Component, pageProps}: AppProps) {
  useFirstEverLoad();

  const [_, set] = useVisitCounts();

  useEffect(() => {
    set(x => x + 1);
  }, [set]);

  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-serif: ${serif.style.fontFamily};
            --font-body: ${body.style.fontFamily};
          }
        `}
      </style>

      <Head>
        <title>Cole Mayke</title>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FadeTransition>
        <Component {...pageProps} />
      </FadeTransition>

      <Toaster />
    </>
  );
}