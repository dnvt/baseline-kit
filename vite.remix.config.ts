import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { alias } from './alias.config.ts'

/** React-free Remix 3 client entry and its Node-only server entry. */
export default defineConfig({
  resolve: { alias },
  build: {
    emptyOutDir: false,
    target: 'es2022',
    lib: {
      entry: {
        remix: resolve(import.meta.dirname, 'packages/remix/src/index.ts'),
        'remix-server': resolve(
          import.meta.dirname,
          'packages/remix/src/server.ts'
        ),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`,
    },
    rolldownOptions: {
      external: [/^node:/, 'remix', /^remix\//, /^@remix-run\//],
    },
    sourcemap: true,
  },
})
