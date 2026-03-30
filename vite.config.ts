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
        { src: 'README.md', dest: '.' },
        {
          src: 'src/components/styles/theme.css',
          dest: '.',
          rename: { stripBase: true },
        },
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
    // Disable lightningcss to preserve CSS @import handling for non-module CSS
    transformer: 'postcss' as const,
  },
  build: {
    cssCodeSplit: false,
    cssMinify: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BaselineKit',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime',
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return '[name]-[hash][extname]'

          if (assetInfo.name.endsWith('theme.css')) {
            return 'theme.css'
          }
          if (assetInfo.name.endsWith('core.css')) {
            return 'styles.css'
          }
          if (assetInfo.name.endsWith('.css')) {
            return 'styles.css'
          }

          return '[name]-[hash][extname]'
        },
      },
    },
    sourcemap: true,
  },
  ...(command === 'serve' && { root: 'demo', base: '/' }),
}))
