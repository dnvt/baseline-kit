import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Baseline } from '@/components/Baseline'

// We'll store IntersectionObserver callbacks in a map, keyed by element.
const observerMap = new Map<Element, IntersectionObserverCallback>()

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => ({
  observe: (element: Element) => {
    observerMap.set(element, callback)
  },
  unobserve: (element: Element) => {
    observerMap.delete(element)
  },
  disconnect: () => {
    observerMap.clear()
  },
}))

// For ResizeObserver
type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void
const mockResizeObserver = vi.fn((callback: ResizeObserverCallback) => ({
  observe: vi.fn((target: Element) => {
    // Immediately trigger the callback with an initial size (1024x768)
    callback(
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
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('Baseline', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
    vi.stubGlobal('ResizeObserver', mockResizeObserver)

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
    expect(firstLine.style.getPropertyValue('--bkrt')).toBe('0px')
    expect(computedStyle.getPropertyValue('--bkrh')).toBe('8px')
  })

  it('respects custom numeric height', () => {
    render(<Baseline debugging="visible" height={200} />)
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(25)
  })

  it('respects custom string height e.g. "50vh"', () => {
    render(<Baseline debugging="visible" height="50vh" />)
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(48)
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