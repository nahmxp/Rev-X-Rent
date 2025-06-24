import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.png?v=2" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=2" />
          <link rel="apple-touch-icon" href="/favicon.png?v=2" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 