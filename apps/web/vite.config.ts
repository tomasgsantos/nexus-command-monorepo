import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nexus-command-monorepo/',
  resolve: {
    alias: [
      {
        find: '@nexus/api',
        replacement: path.resolve(__dirname, '../../apps/api/src/index.ts'),
      },
      {
        find: /^@nexus\/ui\/(.+)$/,
        replacement: path.resolve(__dirname, '../../packages/ui/$1'),
      },
      {
        find: '@nexus/ui',
        replacement: path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
