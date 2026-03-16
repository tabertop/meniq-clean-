import Head from 'next/head'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

export default function TikTokLanding() {
  const router = useRouter()
  const firedView = useRef(false)

  useEffect(() => {
    if (firedView.current) return
    firedView.current = true
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'tiktok_landing_view', {
          event_category: 'tiktok',
          event_label: 'landing_page',
        })
      }
    } catch (_) {}
  }, [])

  function handleStart() {
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'tiktok_quiz_start_click', {
          event_category: 'tiktok',
          event_label: 'cta_start',
        })
      }
    } catch (_) {}
    router.push('/?utm_source=tiktok&utm_medium=organic&utm_campaign=tiktok')
  }

  return (
    <>
      <Head>
        <title>MenIQ — See How You Rank vs Other Men</title>
        <meta name="description" content="Free 30-second men's health score. Private, instant results." />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }

        .tt-root {
          --red:        #C0392B;
          --red-bright: #E74C3C;
          --red-dim:    #8B2020;
          --bg:         #0A0A0A;
          --surface:    #141414;
          --surface2:   #1E1E1E;
          --border:     #2A2A2A;
          --text:       #F0EDE8;
          --muted:      #888;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-font-smoothing: antialiased;
        }

        /* Reuses .mrx-app max-width + centering */
        .tt-card {
          max-width: 420px;
          width: 100%;
          padding: 36px 24px 40px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
        }

        /* Reuses .mrx-logo SVG positioning */
        .tt-logo { margin-bottom: 32px; }

        /* Reuses .mrx-rtag pill */
        .tt-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; color: var(--red-bright);
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px;
        }
        .tt-pill-dot {
          width: 5px; height: 5px; background: var(--red-bright);
          border-radius: 50%; display: inline-block;
        }

        /* Reuses .mrx-h1 Bebas Neue heading */
        .tt-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 13vw, 58px);
          line-height: .92;
          letter-spacing: .01em;
          margin-bottom: 16px;
          color: var(--text);
        }
        .tt-h1 span { color: var(--red-bright); }

        .tt-sub {
          font-size: 15px;
          font-weight: 400;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 320px;
        }

        /* Reuses .mrx-cta button exactly */
        .tt-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 16px; border-radius: 14px; background: var(--red);
          border: none; color: white; font-family: 'DM Sans', sans-serif;
          font-size: 16px; font-weight: 600; cursor: pointer; letter-spacing: .02em;
          transition: all .2s ease; text-decoration: none; margin-bottom: 14px;
        }
        .tt-cta:hover { background: var(--red-bright); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(192,57,43,.35); }
        .tt-cta:active { transform: translateY(0); }

        /* Reuses .mrx-avail-row trust strip */
        .tt-trust {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; flex-wrap: wrap;
          font-size: 12px; color: var(--muted); text-align: center;
        }
        .tt-trust-dot {
          width: 3px; height: 3px; background: var(--muted);
          border-radius: 50%; display: inline-block;
        }

        /* Reuses .mrx-card social proof tiles */
        .tt-stats {
          display: flex; gap: 10px; width: 100%; margin-bottom: 28px;
        }
        .tt-stat {
          flex: 1;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 12px;
          display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
        }
        .tt-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: var(--red-bright); line-height: 1;
        }
        .tt-stat-label {
          font-size: 11px; color: var(--muted); font-weight: 400; line-height: 1.3;
        }
      `}</style>

      <div className="tt-root">
        <div className="tt-card">

          {/* Logo — reuses exact SVG from MaxRxQuiz mrx-logo */}
          <div className="tt-logo">
            <svg width="180" height="32" viewBox="0 0 440 76" xmlns="http://www.w3.org/2000/svg">
              <polyline points="4,56 20,56 29,38 38,68 47,18 56,56 72,56"
                fill="none" stroke="#c0392b" strokeWidth="5.5"
                strokeLinecap="round" strokeLinejoin="round"/>
              <text x="82" y="58" fontFamily="Arial Black, Arial, sans-serif"
                fontWeight="900" fontSize="54" letterSpacing="-1">
                <tspan fill="#ffffff">MEN</tspan>
                <tspan fill="#c0392b">IQ</tspan>
                <tspan fill="#666666">.CO</tspan>
              </text>
            </svg>
          </div>

          {/* Pill label */}
          <div className="tt-pill">
            <span className="tt-pill-dot" />
            Men's Health Assessment
          </div>

          {/* Bebas Neue headline — reuses .mrx-h1 */}
          <h1 className="tt-h1">
            See How You<br />
            <span>Rank vs</span><br />
            Other Men
          </h1>

          <p className="tt-sub">
            Free 30-second test. Private, instant results.
            Used by 10,000+ men.
          </p>

          {/* Social proof tiles — reuse .mrx-card style */}
          <div className="tt-stats">
            <div className="tt-stat">
              <span className="tt-stat-num">30s</span>
              <span className="tt-stat-label">To complete</span>
            </div>
            <div className="tt-stat">
              <span className="tt-stat-num">4</span>
              <span className="tt-stat-label">Health areas scored</span>
            </div>
            <div className="tt-stat">
              <span className="tt-stat-num">100%</span>
              <span className="tt-stat-label">Private & free</span>
            </div>
          </div>

          {/* CTA — reuses .mrx-cta exactly */}
          <button className="tt-cta" onClick={handleStart}>
            Start 30-Second Test →
          </button>

          {/* Trust strip — reuses .mrx-avail-row */}
          <div className="tt-trust">
            <span>Private online visit</span>
            <span className="tt-trust-dot" />
            <span>Licensed U.S. providers</span>
            <span className="tt-trust-dot" />
            <span>No account needed</span>
          </div>

        </div>
      </div>
    </>
  )
}
