import Head from 'next/head'
import dynamic from 'next/dynamic'

const MaxRxQuiz = dynamic(() => import('../components/MaxRxQuiz'), {
  ssr: false,
  loading: () => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0d0d0d',color:'#555',fontFamily:'DM Sans,sans-serif',fontSize:'14px'}}>
      Loading...
    </div>
  )
})

export default function Home() {
  return (
    <>
      <Head>
        <title>MenIQ — Free Men's Health Score Test | See How You Rank</title>
        <meta name="description" content="Take the free 30-second MenIQ men's health assessment. See how you rank vs other men your age. Private, instant results. Used by 10,000+ men." />
        <meta name="keywords" content="men's health quiz, ED assessment, hair loss test, testosterone test, men's health score, sexual health quiz" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="MenIQ.co" />
        <link rel="canonical" href="https://meniq.co" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

        <meta property="og:site_name" content="MenIQ" />
        <meta property="og:title" content="MenIQ — What's Your Men's Health Score?" />
        <meta property="og:description" content="Free 30-second test. See how you rank vs other men your age. Private and instant results." />
        <meta property="og:url" content="https://meniq.co" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://meniq.co/images/meniq-preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="MenIQ Men's Health Score Test" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@meniqco" />
        <meta name="twitter:title" content="MenIQ — What's Your Men's Health Score?" />
        <meta name="twitter:description" content="Free 30-second test. See how you rank vs other men your age." />
        <meta name="twitter:image" content="https://meniq.co/images/meniq-preview.png" />
        <meta name="twitter:image:alt" content="MenIQ Men's Health Score Test" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
        <meta name="theme-color" content="#c0392b" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "MenIQ Men's Health Assessment",
          "url": "https://meniq.co",
          "description": "Free 30-second men's health quiz with personalized results. Private, instant, and used by 10,000+ men.",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Any",
          "isAccessibleForFree": true,
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "provider": { "@type": "Organization", "name": "MenIQ.co", "url": "https://meniq.co" },
          "featureList": ["ED assessment","Hair loss risk score","Testosterone screening","Personalized health profile","Anonymous results"]
        })}} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Is the MenIQ test private?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Completely private. No account required, no data sold." } },
            { "@type": "Question", "name": "How long does the test take?", "acceptedAnswer": { "@type": "Answer", "text": "About 30 seconds. Answer 6 questions and get instant personalized results." } },
            { "@type": "Question", "name": "What does MenIQ test for?", "acceptedAnswer": { "@type": "Answer", "text": "Assessments for erectile dysfunction, hair loss, testosterone levels, and relationship health." } }
          ]
        })}} />

        <script dangerouslySetInnerHTML={{ __html: `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('D6QVB5JC77UD56GIEVNG');ttq.page();}(window, document, 'ttq');` }} />
      </Head>
      <MaxRxQuiz />
    </>
  )
}
