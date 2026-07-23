import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the `@/*` path alias from tsconfig so tests import like the app.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Vitest's esbuild handles the automatic JSX runtime — no @vitejs/plugin-react
  // needed (and it conflicts with the workspace's hoisted vite version).
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Component + unit tests for the web app. Domain/business logic is tested
    // in @toolshare/domain; this covers app-level utils and React components.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
