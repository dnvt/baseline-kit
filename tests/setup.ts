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

// Viewport setup
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true })
}

// CSS root setup
const setRootFontSize = (size: string) => {
  Object.defineProperty(document.documentElement.style, 'fontSize', {
    value: size,
    configurable: true,
  })
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    // Simulate initial observation
    this.callback([
      {
        target,
        contentRect: target.getBoundingClientRect(),
      } as ResizeObserverEntry,
    ], this as ResizeObserver)
  }

  unobserve() {
  }

  disconnect() {
  }
} as unknown as typeof ResizeObserver

global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]

  callback: IntersectionObserverCallback
  options: IntersectionObserverInit

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback
    this.options = options
  }

  observe(target: Element) {
    // Simulate intersection
    this.callback([
      {
        target,
        isIntersecting: true,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: 1,
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as IntersectionObserverEntry,
    ], this)
  }

  unobserve() {
  }

  disconnect() {
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
} as unknown as typeof IntersectionObserver

// Setup default viewport and CSS environment
beforeAll(() => {
  setViewportSize(1024, 768)
  setRootFontSize('16px')

  // Mock getComputedStyle
  window.getComputedStyle = (element: Element) => ({
    fontSize: element === document.documentElement ? '16px' : '16px',
    width: '1024px',
    height: '768px',
  } as CSSStyleDeclaration)
})

// Helper functions for tests
export const testUtils = {
  setViewportSize,
  setRootFontSize,
  mockElementSize: (element: HTMLElement, width: number, height: number) => {
    element.getBoundingClientRect = () => ({
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => '',
    })
  },
}

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
