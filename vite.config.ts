import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'
import { alias } from './alias.config.ts'

/** React and core entries. Styles are copied by scripts/build-css.js. */
export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'packages/react/src/index.ts'),
        core: resolve(import.meta.dirname, 'packages/core/src/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/],
    },
    sourcemap: true,
  },
})
