import Head from 'next/head'
import { useEffect } from 'react'
import '../styles/globals.css'

const GA_ID = 'G-T0YGHRKCQ6'

function scrollToCTA() {
  // Find the primary CTA button — .mrx-cta contains "Start My Free Visit"
  const cta = document.querySelector('a.mrx-cta, button.mrx-cta');
  if (!cta) return;

  const rect = cta.getBoundingClientRect();
  const viewportH = window.innerHeight;
  const PADDING = 24; // px below CTA bottom

  // Only scroll if CTA bottom is below the viewport
  if (rect.bottom > viewportH - PADDING) {
    const scrollAmount = rect.bottom - viewportH + PADDING;
    window.scrollTo({ top: window.scrollY + scrollAmount, behavior: 'instant' });
  }
}

export default function App({ Component, pageProps }) {

  useEffect(() => {
    // Run only once on initial load.
    // Cancel if user interacts before we fire.
    let cancelled = false;
    const cancel = () => { cancelled = true; };
    window.addEventListener('scroll',     cancel, { once: true, passive: true });
    window.addEventListener('touchstart', cancel, { once: true, passive: true });

    // First attempt: after initial render
    const t1 = setTimeout(() => {
      if (!cancelled && window.scrollY === 0) scrollToCTA();
    }, 100);

    // Second attempt: after fonts/images may have shifted layout
    const t2 = setTimeout(() => {
      if (!cancelled && window.scrollY === 0) scrollToCTA();
      window.removeEventListener('scroll',     cancel);
      window.removeEventListener('touchstart', cancel);
    }, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll',     cancel);
      window.removeEventListener('touchstart', cancel);
    };
  }, []); // runs once on mount

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
