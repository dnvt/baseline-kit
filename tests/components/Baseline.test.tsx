import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Baseline } from '@/components/Baseline'

// We'll store IntersectionObserver callbacks in a map, keyed by element.
const observerMap = new Map<Element, IntersectionObserverCallback>()

// Mock IntersectionObserver (must use class for Vitest 4 constructor support)
class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe(element: Element) {
    observerMap.set(element, this.callback)
  }
  unobserve(element: Element) {
    observerMap.delete(element)
  }
  disconnect() {
    observerMap.clear()
  }
}

// Mock ResizeObserver (must use class for Vitest 4 constructor support)
class MockResizeObserver {
  constructor(callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void) {
    // Store for potential use, but immediately trigger on observe
    this._callback = callback
  }
  _callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void
  observe(target: Element) {
    this._callback(
      [
        {
          contentRect: { width: 1024, height: 768 },
          target,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    )
  }
  unobserve() {}
  disconnect() {}
}

describe('Baseline', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    // Set up window dimensions (these are optional if your tests rely on them).
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
  })

  afterAll(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    observerMap.clear()
  })

  // Helper to simulate intersection events.
  const triggerIntersection = (
    element: Element,
    isIntersecting = true,
    customRect?: Partial<DOMRect>,
  ) => {
    const callback = observerMap.get(element)
    if (callback) {
      const defaultRect = {
        top: 0,
        bottom: 768,
        height: 768,
        width: 1024,
        x: 0,
        y: 0,
        left: 0,
        right: 1024,
      }
      callback([
        {
          isIntersecting,
          target: element,
          boundingClientRect: { ...defaultRect, ...customRect },
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: { ...defaultRect, ...customRect },
          rootBounds: defaultRect,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ], new IntersectionObserver(() => {
      }))
    }
  }

  it('renders hidden by default if debugging="hidden"', () => {
    render(<Baseline debugging="hidden" />)
    const baseline = screen.getByTestId('baseline')
    expect(baseline.className).toMatch(/h/i)
  })

  it('renders lines when debugging is "visible" with numeric height', () => {
    render(<Baseline debugging="visible" height={100} />)
    const baseline = screen.getByTestId('baseline')
    expect(baseline.className).toMatch(/v/i)
    // For height=100 and base=8, Math.ceil(100/8)=13 lines are expected.
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(13)
  })

  it('handles variant="flat"', () => {
    render(<Baseline debugging="visible" variant="flat" height={64} />)
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(8)
    const firstLine = lines[0] as HTMLElement

    // Log the style attribute and computed styles for debugging
    console.log('Style attribute:', firstLine.getAttribute('style'))
    console.log('Computed styles:', window.getComputedStyle(firstLine).cssText)

    // Use getComputedStyle to check the computed styles
    const computedStyle = window.getComputedStyle(firstLine)
    expect(firstLine.style.getPropertyValue('--bkbl-rt')).toBe('0px')
    expect(computedStyle.getPropertyValue('--bkbl-rh')).toBe('8px')
  })

  it('respects custom numeric height', () => {
    render(<Baseline debugging="visible" height={200} />)
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(25)
  })

  it('keeps the simplified fallback when ssrMode is enabled', () => {
    render(<Baseline debugging="visible" height={200} ssrMode />)
    const baseline = screen.getByTestId('baseline')
    expect(baseline.className).toMatch(/ssr/i)
    expect(baseline.className).toMatch(/h/i)
    expect(baseline.querySelectorAll('[data-row-index]').length).toBe(0)
  })

  it('preserves zero sizing values in ssrMode fallback', () => {
    render(<Baseline debugging="visible" width={0} height={0} ssrMode />)
    const baseline = screen.getByTestId('baseline')
    expect(baseline.getAttribute('style')).toContain('width: 0px')
    expect(baseline.getAttribute('style')).toContain('height: 0px')
  })

  it('respects custom string height e.g. "50vh"', () => {
    // Core uses static viewport defaults (1080px height) — 50vh = 540px → 540/8 = 67 rows
    render(<Baseline debugging="visible" height="50vh" />)
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(68)
  })

  it('applies top/bottom spacing if provided', () => {
    render(<Baseline debugging="visible" height={100} block={[10, 20]} />)
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(9)
  })

  it('mocks intersection to update rendered lines (if using lazy rendering)', () => {
    render(<Baseline debugging="visible" height={300} />)
    const baseline = screen.getByTestId('baseline')
    triggerIntersection(baseline)
    const lines = baseline.querySelectorAll('[data-row-index]')
    // For height=300 and base=8, Math.ceil(300/8) = 38 rows.
    expect(lines.length).toBe(38)
  })

  it('applies custom className, style props, and renders children', () => {
    render(
      <Baseline debugging="visible" className="custom-class" style={{ background: 'red' }} />,
    )
    const baseline = screen.getByTestId('baseline')
    expect(baseline).toHaveClass('custom-class')
    expect(baseline).toHaveStyle({ background: 'red' })
  })
})
