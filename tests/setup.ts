import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { customMatchers } from './matchers'
import './mocks'

expect.extend(customMatchers)

// Helpers for viewport and CSS setup
export const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true })
}

export const setRootFontSize = (size: string) => {
  document.documentElement.style.fontSize = size
}

beforeAll(() => {
  setViewportSize(1024, 768)
  setRootFontSize('16px')
  // Capture the original getComputedStyle before overriding it.
  const originalGetComputedStyle = window.getComputedStyle.bind(window)
  window.getComputedStyle = (element: Element) => {
    const style = originalGetComputedStyle(element)
    return {
      ...style,
      getPropertyValue: (prop: string) => style.getPropertyValue(prop),
    }
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

export * from '@testing-library/react'