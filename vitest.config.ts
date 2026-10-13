import { defineConfig } from 'vitest/config'
import { alias } from './alias.config.ts'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: { alias },
})
