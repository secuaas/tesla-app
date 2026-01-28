/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@teslavault/shared'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
