/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: process.env.IMAGE_HOST && [process.env.IMAGE_HOST]
  },
  compiler: {
    emotion: true,
  },
  transpilePackages: ['@mui/icons-material', '@mui/x-date-pickers', '@devexpress/dx-react-grid-material-ui'],
};

export default nextConfig;
