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
          src: 'packages/react/src/components/styles/reset.css',
          dest: '.',
          rename: { stripBase: true },
        },
        {
          src: 'packages/react/src/components/styles/theme.css',
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
    cssCodeSplit: true,
    cssMinify: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'packages/react/src/index.ts'),
        core: resolve(__dirname, 'packages/core/src/index.ts'),
      },
      name: 'BaselineKit',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
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
          const assetName = assetInfo.name.toLowerCase()

          if (assetName.endsWith('theme.css')) {
            return 'theme.css'
          }
          if (assetName.endsWith('.css')) {
            if (assetName.includes('guide')) return 'guide.css'
            if (assetName.includes('index')) return 'styles.css'
            return '[name][extname]'
          }

          return '[name]-[hash][extname]'
        },
      },
    },
    sourcemap: true,
  },
  ...(command === 'serve' && { root: 'demo', base: '/' }),
}))
