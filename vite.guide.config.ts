import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { alias } from './alias.config'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]_[hash:base64:5]',
    },
    transformer: 'postcss' as const,
  },
  build: {
    emptyOutDir: false,
    cssCodeSplit: false,
    cssMinify: true,
    lib: {
      entry: resolve(__dirname, 'packages/react/src/guide.ts'),
      name: 'BaselineKitGuide',
      formats: ['es', 'cjs'],
      fileName: (format) => `guide.${format === 'es' ? 'mjs' : 'cjs'}`,
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
          if (assetInfo.name?.toLowerCase().endsWith('.css')) {
            return 'guide.css'
          }
          return '[name]-[hash][extname]'
        },
      },
    },
    sourcemap: true,
  },
})
