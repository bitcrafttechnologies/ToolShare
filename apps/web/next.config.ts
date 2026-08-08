import type { NextConfig } from 'next';
import path from 'node:path';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
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
    // NOTE: experimental.optimizePackageImports was removed 2026-07-27 — it made
    // the Turbopack *dev* compile of `/` run away to ~9.5 GB and never finish
    // (production `next build` was unaffected). Re-add with caution.
  };

  // Standalone output + the monorepo tracing root are only needed for the
  // production Docker build (Cloud Run). Applying outputFileTracingRoot in
  // `next dev` makes Turbopack treat the whole repo root as the project root —
  // which now contains a 465 MB google-cloud-sdk/ — bloating the first compile.
  // Scope them to the build phase so dev stays lean.
  if (phase === PHASE_PRODUCTION_BUILD) {
    config.output = 'standalone';
    config.outputFileTracingRoot = path.join(__dirname, '../../');
  }

  return config;
}
