/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: process.env.IMAGE_HOST && [process.env.IMAGE_HOST]
  }
};

module.exports = nextConfig;
