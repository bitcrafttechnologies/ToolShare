import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@toolshare/types', '@toolshare/supabase', '@toolshare/domain', '@toolshare/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@toolshare/types', '@toolshare/supabase', '@toolshare/domain', '@toolshare/ui'],
  },
};

export default config;