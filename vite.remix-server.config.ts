import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    emptyOutDir: false,
    target: 'node24',
    lib: {
      entry: resolve(import.meta.dirname, 'packages/remix/src/server.ts'),
      formats: ['es'],
      fileName: () => 'remix-server.mjs',
    },
    rolldownOptions: { external: [/^node:/, /^remix\//] },
    sourcemap: true,
  },
})
