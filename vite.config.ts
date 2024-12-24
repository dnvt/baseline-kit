import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

const resolvePath = (...paths: string[]) => resolve(__dirname, ...paths)

export default defineConfig(({ command }) => ({
  plugins: [react()],
  css: {
    modules: {
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:base64:8]'
          : '[name]__[local]__[hash:base64:5]',
      localsConvention: 'camelCase',
    },
    postcss: {
      plugins: [
        autoprefixer(),
        ...(process.env.NODE_ENV === 'production'
          ? [cssnano({ preset: 'default' })]
          : []),
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolvePath('src/lib'),
      '@components': resolvePath('src/lib/components'),
      '@hooks': resolvePath('src/lib/hooks'),
      '@types': resolvePath('src/lib/types'),
      '@utils': resolvePath('src/lib/utils'),
      '@styles': resolvePath('src/lib/styles/modules'),
    },
  },
  build: {
    lib: {
      entry: resolvePath('src/lib/index.ts'),
      name: 'PaddedGrid',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // Place all extracted CSS in a single file
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'styles.css'
          }
          return '[name][extname]'
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false, // Ensures one CSS file output
  },
  ...(command === 'serve' && {
    root: 'demo',
    base: '/',
  }),
}))
