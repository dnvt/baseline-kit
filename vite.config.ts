import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { alias } from './alias.config'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { visualizer } from 'rollup-plugin-visualizer'
import fs from 'fs'

// Create the combined CSS file
const createCombinedCSS = () => {
  try {
    const corePath = resolve(__dirname, 'src/components/styles/core.css')
    const themePath = resolve(__dirname, 'src/components/styles/theme.css')
    
    const core = fs.readFileSync(corePath, 'utf8')
    const theme = fs.readFileSync(themePath, 'utf8')
    const combined = `${core}\n\n${theme}`
    
    const tempFile = resolve(__dirname, '.temp-combined.css')
    fs.writeFileSync(tempFile, combined)
    return tempFile
  } catch (error) {
    console.error('Error creating combined CSS:', error)
    return null
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: resolve(__dirname, 'README.md'), dest: '.' },
        { src: resolve(__dirname, 'src/components/styles/theme.css'), dest: '.' }
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
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BaselineKit',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime', 
        'react/jsx-dev-runtime'
      ],
      output: {
        globals: { 
          react: 'React', 
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime'
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
  ...(command === 'serve' && { root: 'demo', base: '/' }), // @todo remove soon
}))
