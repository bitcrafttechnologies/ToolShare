import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  // Emit a self-contained server bundle for containerized deploys (Cloud Run).
  output: 'standalone',
  // In a monorepo, trace files from the repo root so workspace packages
  // (@toolshare/*) and the hoisted node_modules are included in the bundle.
  outputFileTracingRoot: path.join(__dirname, '../../'),
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