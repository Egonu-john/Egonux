/** @type {import('next').NextConfig} */
const developmentScriptSource =
  process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
const developmentConnectSource =
  process.env.NODE_ENV === 'development' ? ' ws: wss:' : '';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              `connect-src 'self' https://vitals.vercel-insights.com${developmentConnectSource}`,
              "font-src 'self' data:",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "img-src 'self' data: blob:",
              "object-src 'none'",
              `script-src 'self' 'unsafe-inline'${developmentScriptSource}`,
              "style-src 'self' 'unsafe-inline'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), geolocation=(), microphone=(), payment=()',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
