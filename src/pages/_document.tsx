import Document, { DocumentContext, Html, Head, NextScript, Main } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import React from 'react';

export default class extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => {
            return (props) => sheet.collectStyles(<App {...props} />);
          },
        });

      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" type="image/png" href="https://avatars3.githubusercontent.com/u/25351731?s=460&v=4" />
          <meta name="theme-color" content="#ffe8e8" />
          <meta name="description" content="Alistair Smith, Full–stack TypeScript engineer from the UK" />
          <link rel="stylesheet" href={'https://rsms.me/inter/inter.css'} />
        </Head>
        <body>
          <noscript>
            <p>You need to enable JavaScript to run this app.</p>
            <img src="https://lab.alistair.cloud/noscript.gif" alt="" />
          </noscript>
          <Main />
          <NextScript />
          <script async defer src={'https://lab.alistair.cloud/latest.js'} />
        </body>
      </Html>
    );
  }
}
