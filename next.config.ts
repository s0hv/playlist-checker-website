import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: process.env.IMAGE_HOST
      ? [
        new URL(process.env.IMAGE_HOST),
      ]
      : undefined,
  },
  poweredByHeader: false,
};

export default nextConfig;
