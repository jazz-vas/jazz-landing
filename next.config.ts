import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath: '/landing',
  assetPrefix: '/landing',
  images: {
    unoptimized: true,
  },
  // Output standalone for production deployment
  output: 'standalone',
  async rewrites() {
    return [
      // Serve public folder assets under /landing as well
      { source: '/landing/:path*.png', destination: '/:path*.png' },
      { source: '/landing/:path*.jpg', destination: '/:path*.jpg' },
      { source: '/landing/:path*.jpeg', destination: '/:path*.jpeg' },
      { source: '/landing/:path*.webp', destination: '/:path*.webp' },
      { source: '/landing/:path*.svg', destination: '/:path*.svg' },
      { source: '/landing/:path*.ico', destination: '/:path*.ico' },
    ];
  },
};

export default nextConfig;
