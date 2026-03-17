import Head from 'next/head'
import { useEffect } from 'react'
import '../styles/globals.css'

const GA_ID = 'G-T0YGHRKCQ6'

export default function App({ Component, pageProps }) {

  useEffect(() => {
    // Initial scroll offset — runs once on page load only.
    // Shifts viewport down ~90px so CTAs are more visible on mobile.
    // Instant (no animation), only if user hasn't already scrolled.
    let fired = false;
    const onInteract = () => { fired = true; };
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('touchstart', onInteract, { once: true, passive: true });

    const timer = setTimeout(() => {
      if (!fired && window.scrollY === 0) {
        window.scrollTo({ top: 90, behavior: 'instant' });
      }
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('touchstart', onInteract);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, []); // empty deps — runs once on initial mount only

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
