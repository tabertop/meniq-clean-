import Head from 'next/head'
import '../styles/globals.css'

const GA_ID = 'G-T0YGHRKCQ6'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* GA4 — loads on every page */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}} />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
