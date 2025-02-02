import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const resolvePath = (...paths: string[]) => resolve(__dirname, ...paths)

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      exclude: [
        'demo/**/*',
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
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolvePath('src/lib'),
      '@components': resolvePath('src/lib/components'),
      '@context': resolvePath('src/lib/context'),
      '@hooks': resolvePath('src/lib/hooks'),
      '@types': resolvePath('src/lib/types'),
      '@utils': resolvePath('src/lib/utils'),
    },
  },
})