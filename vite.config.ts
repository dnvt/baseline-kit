import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { alias } from './alias.config'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: resolve(__dirname, 'README.md'), dest: '.' },
        { src: resolve(__dirname, 'src/components/theme/theme.css'), dest: '.' }, // Copy theme.css to dist
      ],
    }),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
    }),
  ],
  resolve: { alias },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]_[hash:base64:5]',
    },
  },
  build: {
    cssCodeSplit: false, // Combine all CSS into styles.css
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BaselineKit',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
        assetFileNames: (assetInfo) =>
          assetInfo.name && assetInfo.name.endsWith('.css')
            ? 'styles.css' // Output styles.css
            : assetInfo.name ?? '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
  ...(command === 'serve' && { root: 'demo', base: '/' }),
}))
