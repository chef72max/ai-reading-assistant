/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      canvas: false,
    };
    return config;
  },
}

module.exports = nextConfig
