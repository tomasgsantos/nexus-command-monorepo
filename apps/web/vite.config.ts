import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

const svgMockPlugin: Plugin = {
  name: 'svg-mock',
  enforce: 'pre',
  apply: 'serve',
  resolveId(id) {
    if (process.env.VITEST && id.endsWith('.svg?react')) {
      return '\0svg-mock'
    }
  },
  load(id) {
    if (id === '\0svg-mock') {
      return `import { createElement } from 'react'; export default () => createElement('span', {}, 'SvgIcon');`
    }
  },
}

export default defineConfig({
  plugins: [react(), svgr(), svgMockPlugin],
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
    alias: [
      { find: 'framer-motion', replacement: new URL('./__mocks__/framer-motion.ts', import.meta.url).pathname },
    ],
  },
})
