import React, { StrictMode } from 'react';
import { AppProps } from 'next/app';

import { Provider } from 'jotai';
import { GlobalStyle } from '../GlobalStyle';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <Head>
        <title>Alistair Smith</title>
      </Head>
      <Provider>
        <GlobalStyle />
        <Component {...pageProps} />
      </Provider>
    </StrictMode>
  );
}
