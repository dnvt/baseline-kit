import { defineConfig } from 'vitest/config'
import { alias } from './alias.config'

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
        'tests/**/*',
        'src/**/index.ts',
        'node_modules/**/*',
        '**/*.d.ts',
        '**/*.js',
        '.eslintrc.cjs',
        'index.ts',
        'vite.config.mts',
        'vitest.config.ts',
        'alias.config.ts',
      ],
    },
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: { alias },
})