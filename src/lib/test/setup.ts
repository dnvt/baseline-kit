import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { customMatchers } from './matchers'

expect.extend(customMatchers)

// Mock CSS Modules
vi.mock('@styles/*.css', () => ({
  default: {
    container: 'container',
    columnsContainer: 'columnsContainer',
    column: 'column',
    lineColumn: 'lineColumn',
    row: 'row',
    flatRow: 'flatRow',
    visible: 'visible',
    hidden: 'hidden',
  },
}))

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
  }

  unobserve() {
  }

  disconnect() {
  }
} as never

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {
  }

  unobserve() {
  }

  disconnect() {
  }
} as never

// Clean up after each test
afterEach(() => {
  cleanup()
})
