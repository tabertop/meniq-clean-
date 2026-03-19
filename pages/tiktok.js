import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function TikTok() {
  const router = useRouter()
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'tiktok_landing_view', {
          event_category: 'tiktok',
          event_label: 'landing_redirect',
        })
      }
    } catch (_) {}
    router.replace('/?quiz=ed_tiktok&utm_source=tiktok&utm_medium=organic&utm_campaign=tiktok')
  }, []) // eslint-disable-line
  return <Head><meta name="robots" content="noindex, nofollow" /></Head>
}
