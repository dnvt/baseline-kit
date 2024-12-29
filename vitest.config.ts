import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const resolvePath = (...paths: string[]) => resolve(__dirname, ...paths)

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/lib/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      exclude: [
        'demo/**/*',
        'src/lib/__tests__/**/*',
        'src/**/index.ts',
        '**/production.js',
        '**/*.d.ts',
        '**/*.js',
        '.eslintrc.cjs',
        'index.ts',
        'vite.config.mts',
        'vitest.config.ts',
        '**/react-jsx-runtime.production.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolvePath('src/lib'),
      '@components': resolvePath('src/lib/components'),
      '@config': resolvePath('src/lib/config'),
      '@hooks': resolvePath('src/lib/hooks'),
      '@types': resolvePath('src/lib/types'),
      '@utils': resolvePath('src/lib/utils'),
    },
  },
})
