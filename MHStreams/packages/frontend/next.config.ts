import type { NextConfig } from 'next';

const pathToCoreFromFrontend = '../core/src';
const isProductionBuild = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  output: isProductionBuild ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      './ptt.js': './ptt',
      './regex.js': './regex',
      '../utils/languages.js': '../utils/languages',
      '../utils/constants.js': '../utils/constants',
    };
    return config;
  },

  turbopack: {
    resolveAlias: {
      // 'fs': false,
      './regex.js': `${pathToCoreFromFrontend}/parser/regex`,
      '../utils/languages.js': `${pathToCoreFromFrontend}/utils/languages`,
      '../utils/constants.js': `${pathToCoreFromFrontend}/utils/constants`,
    },
  },

  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
