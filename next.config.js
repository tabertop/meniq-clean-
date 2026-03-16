/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cache busting — unique buildId every Vercel deploy
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString();
  },

  // Allow embedding in Telegram WebApp and other iframes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
      {
        source: '/images/:path*.png',
        headers: [{ key: 'Content-Type', value: 'image/png' }],
      },
      {
        source: '/images/:path*.jpg',
        headers: [{ key: 'Content-Type', value: 'image/jpeg' }],
      },
    ]
  },
}

module.exports = nextConfig
