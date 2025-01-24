import { renderHook, act } from '@testing-library/react'
import { useGuideDimensions } from '@hooks'
import { cssTestUtils } from '../matchers/cssTestUtils'
import { testUtils } from '../setup'

// We'll store ResizeObserver callbacks in a map, keyed by the element.
const observerMap = new Map<HTMLElement, ResizeObserverCallback>()

// Mock the global ResizeObserver
const mockResizeObserver = vi.fn().mockImplementation((callback: ResizeObserverCallback) => ({
  observe: vi.fn((element: HTMLElement) => {
    // store the callback so we can trigger it in tests
    observerMap.set(element, callback)
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('useGuideDimensions', () => {
  beforeEach(() => {
    // 1) Mock timers so we can call vi.runAllTimers() if needed
    vi.useFakeTimers()

    // 2) Stub requestAnimationFrame so rafThrottle calls happen synchronously
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      // call callback immediately
      cb(performance.now())
      return 0
    })

    vi.clearAllMocks()
    observerMap.clear()
  })

  afterEach(() => {
    // optionally restore real requestAnimationFrame if you want
    vi.unstubAllGlobals()
  })

  it('returns zero dimensions if ref is null', () => {
    const ref = { current: null } as never
    const { result } = renderHook(() => useGuideDimensions(ref))
    expect(result.current).toEqual({ width: 0, height: 0 })
    // No observer is used
    expect(mockResizeObserver).not.toHaveBeenCalled()
  })

  it('initially returns zero if no layout measurement has occurred', () => {
    // We won't manually invoke the observer callback
    const element = document.createElement('div')
    const ref = { current: element } as never
    const { result } = renderHook(() => useGuideDimensions(ref))
    // The effect sets up an observer, but we haven't triggered it
    expect(result.current).toEqual({ width: 0, height: 0 })
  })

  //  it('updates dimensions when element resizes', () => {
  //    const element = document.createElement('div')
  //    // First bounding rect
  //    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 100, height: 200 })
  //
  //    const ref = { current: element }
  //    const { result } = renderHook(() => useGuideDimensions(ref))
  //
  //    // Because we do immediate measure, result.current should be {100,200} now
  //    expect(result.current).toEqual({ width: 100, height: 200 })
  //
  //    // Next, we "resize" the element
  //    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 150, height: 300 })
  //
  //    // Simulate observer event
  //    act(() => {
  //      const cb = observerMap.get(element)
  //      cb?.([{ target: element }] as ResizeObserverEntry[], {} as ResizeObserver)
  //      // If needed, flush timers or let requestAnimationFrame run
  //      // e.g. vi.runAllTicks() or vi.runAllTimers() if your throttle uses setTimeout fallback
  //    })
  //
  //    // Now the dimension should be updated
  //    expect(result.current).toEqual({ width: 150, height: 300 })
  //  })

  //  it('also observes the parent element if present', () => {
  //    const parent = document.createElement('div')
  //    const child = document.createElement('div')
  //    parent.appendChild(child)
  //
  //    // child => e.g. 90x90
  //    child.getBoundingClientRect = vi.fn().mockReturnValue({ width: 90, height: 90 })
  //    // parent => e.g. 120x120
  //    parent.getBoundingClientRect = vi.fn().mockReturnValue({ width: 120, height: 120 })
  //
  //    const ref = { current: child } as never
  //    renderHook(() => useGuideDimensions(ref))
  //
  //    // The hook calls observer.observe(child) & observer.observe(parent)
  //    expect(mockResizeObserver).toHaveBeenCalledTimes(1) // created once
  //    expect(observerMap.size).toBe(2)
  //    expect(observerMap.has(child)).toBe(true)
  //    expect(observerMap.has(parent)).toBe(true)
  //  })

  describe('Dimension Normalization', () => {
    beforeEach(() => {
      cssTestUtils.createTestContext({
        viewportWidth: 1024,
        viewportHeight: 768,
      })
    })

    it('normalizes element dimensions to integer px using unit=1', () => {
      const element = document.createElement('div')
      // 100.6 => 101, 200.4 => 200 (assuming standard rounding)
      testUtils.mockElementSize(element, 100.6, 200.4)

      const ref = { current: element } as never
      const { result } = renderHook(() => useGuideDimensions(ref))

      // Trigger observer
      act(() => {
        const cb = observerMap.get(element)
        cb?.([{ target: element } as unknown as ResizeObserverEntry], {} as ResizeObserver)
      })

      expect(result.current).toEqual({ width: 101, height: 200 })
    })

    it('handles zero height element => checks parent', () => {
      const parent = document.createElement('div')
      const child = document.createElement('div')
      parent.appendChild(child)

      // child => 0, parent => e.g. 400
      child.getBoundingClientRect = vi.fn().mockReturnValue({ width: 0, height: 0 })
      parent.getBoundingClientRect = vi.fn().mockReturnValue({ width: 0, height: 400 })

      const ref = { current: child } as never
      const { result } = renderHook(() => useGuideDimensions(ref))

      // Simulate the parent's observer callback
      act(() => {
        const cbParent = observerMap.get(parent)
        cbParent?.([{ target: parent } as unknown as ResizeObserverEntry], {} as ResizeObserver)
      })

      expect(result.current).toEqual({ width: 0, height: 400 })
    })
  })
})