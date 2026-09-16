import { defineConfig } from 'vite'
import { resolve } from 'path'
import { alias } from './alias.config.ts'

export default defineConfig({
  resolve: { alias },
  build: {
    emptyOutDir: false,
    cssCodeSplit: false,
    cssMinify: true,
    lib: {
      entry: resolve(import.meta.dirname, 'packages/remix/src/index.ts'),
      name: 'BaselineKitRemix',
      formats: ['es'],
      fileName: () => 'remix.mjs',
    },
    rolldownOptions: {
      external: ['remix', /^remix\//, /^@remix-run\//],
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css')
            ? 'remix.css'
            : '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
