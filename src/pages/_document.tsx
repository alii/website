import Document, {Html, Head, NextScript, Main} from 'next/document';

export default class extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" type="image/png" href="https://avatars3.githubusercontent.com/u/25351731?s=460&v=4" />
          <meta name="theme-color" content="#ffe8e8" />
          <meta name="description" content="Alistair Smith, Full–stack TypeScript engineer from the UK" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&family=Space+Mono:wght@700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script async defer src={'https://lab.alistair.cloud/latest.js'} />
        </body>
      </Html>
    );
  }
}
