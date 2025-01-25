import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Baseline } from '@/components/Baseline'

// We'll store IntersectionObserver callbacks in a map, keyed by element:
const observerMap = new Map<Element, IntersectionObserverCallback>()

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
  return {
    observe: (element: Element) => {
      observerMap.set(element, callback)
    },
    unobserve: (element: Element) => {
      observerMap.delete(element)
    },
    disconnect: () => {
      observerMap.clear()
    },
  }
})

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

    // Mock the observers
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
    vi.stubGlobal('ResizeObserver', mockResizeObserver)

    // Set up window dimensions
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

  // Helper to simulate intersection
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

  it('renders hidden by default if config says hidden', () => {
    // If your real code uses config=hidden by default, or you pass visibility="hidden"
    render(<Baseline debugging="hidden" />)
    // Because it's hidden => we do still create the element, but your code might hide lines
    // or if your code returns null when hidden, adapt accordingly:
    const baseline = screen.getByTestId('baseline')
    // Usually you'd see "hidden" class
    expect(baseline.className).toMatch(/hidden/i)
  })

  it('renders lines when visible', () => {
    render(<Baseline debugging="visible" height={100} />)
    const baseline = screen.getByTestId('baseline')
    expect(baseline.className).toMatch(/visible/i)

    // Once we measure the container (via ResizeObserver),
    // rowCount = 100 / base=8 => 13 lines
    // But the code might just do an immediate measure of 768 if height was `'100%'`.
    // Because we forced height=100 => let's see if it does 12 or 13 lines:
    // We can confirm the .map => rowCount = ceiling(100/8)=13
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(13)
  })

  it('handles variant="flat"', () => {
    // variant=flat => each row's height= base px
    render(<Baseline debugging="visible" variant="flat" height={64} />)
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    // 64 / base(8)=8 lines
    expect(lines.length).toBe(8)

    // The first line => style.height= "8px"
    const firstLine = lines[0] as HTMLElement
    expect(firstLine.style.height).toBe('8px')
  })

  it('respects custom numeric height', () => {
    render(<Baseline debugging="visible" height={200} />)
    const baseline = screen.getByTestId('baseline')
    // 200 / 8 => 25 lines
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(25)
  })

  it('respects custom string height e.g. "50vh"', () => {
    // e.g. "50vh" => ~384 px if innerHeight=768
    render(<Baseline debugging="visible" height="50vh" />)
    const baseline = screen.getByTestId('baseline')
    // 384 / 8 => 48 lines
    const lines = baseline.querySelectorAll('[data-row-index]')
    expect(lines.length).toBe(48)
  })

  it('applies top/bottom spacing if provided', () => {
    // e.g. block=[10,20]
    // Then total leftover = height(100)- (10+20)=70 => rowCount=70/8 => 9 lines
    render(
      <Baseline
        debugging="visible"
        height={100}
        block={[10, 20]}
      />,
    )
    const baseline = screen.getByTestId('baseline')
    const lines = baseline.querySelectorAll('[data-row-index]')
    // 70 / 8 => 8.75 => ceiling => 9
    expect(lines.length).toBe(9)
  })

  it('mocks intersection if your code partial-renders lines (if so)', () => {
    // If you do partial or lazy rendering based on intersection, you'd do:
    // For demonstration we'll just do:
    render(<Baseline debugging="visible" height={300} />)
    const baseline = screen.getByTestId('baseline')
    // Simulate intersection
    triggerIntersection(baseline)
    // etc. if your code updates after intersection, check lines
    const lines = baseline.querySelectorAll('[data-row-index]')
    // should be 300/8 => 38 lines
    expect(lines.length).toBe(38)
  })
})