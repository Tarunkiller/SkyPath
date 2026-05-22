/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^\/api\/flights/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'flight-search-cache',
        expiration: {
          maxAgeSeconds: 300,
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|woff2|png|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^\/_next\/data\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: '_next-data',
        expiration: {
          maxAgeSeconds: 300,
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [],
  },
};

module.exports = withPWA(nextConfig);
