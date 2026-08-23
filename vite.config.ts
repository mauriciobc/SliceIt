import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/SliceIt/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Keep well-known vendor families in stable, cacheable chunks so a
          // typical hit ships only the app shell + changed chunks.
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: 'state-vendor',
              test: /node_modules[\\/](zustand|immer|use-sync-external-store)[\\/]/,
              priority: 30,
            },
            {
              name: 'd3-vendor',
              test: /node_modules[\\/]d3-[a-z-]+[\\/]/,
              priority: 30,
            },
            {
              name: 'radix-vendor',
              test: /node_modules[\\/](@radix-ui|radix-ui)[\\/]/,
              priority: 30,
            },
            {
              name: 'ui-vendor',
              test: /node_modules[\\/](lucide-react|class-variance-authority|clsx|tailwind-merge|react-dropzone)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
              minSize: 32 * 1024,
            },
          ],
        },
      },
    },
  },
});
