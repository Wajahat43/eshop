//@ts-check
const path = require('path');

// Removed Nx plugin usage for Vercel build

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'ik.imagekit.io',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://your-render-app.onrender.com',
    NEXT_PUBLIC_CHAT_WEBSOCKET_URI:
      process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URI || 'wss://your-render-app.onrender.com/chat',
  },
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      packages: path.resolve(__dirname, '../../packages'),
      '@packages': path.resolve(__dirname, '../../packages'),
    };
    return config;
  },
};

module.exports = nextConfig;
