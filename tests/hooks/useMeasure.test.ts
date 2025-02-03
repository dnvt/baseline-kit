import { renderHook, act } from '@testing-library/react'
import { useMeasure } from '@hooks'

// Create a map to simulate ResizeObserver callbacks.
const observerMap = new Map<HTMLElement, ResizeObserverCallback>()

// Mock ResizeObserver
const mockResizeObserver = vi.fn().mockImplementation((callback: ResizeObserverCallback) => ({
  observe: (el: HTMLElement) => observerMap.set(el, callback),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('ResizeObserver', mockResizeObserver)

// Stub rafThrottle to use requestAnimationFrame normally.
vi.mock('@utils', () => ({
  rafThrottle: (fn: Function) => {
    let rafId: number | null = null
    return (...args: unknown[]) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        fn(...args)
        rafId = null
      })
    }
  },
}))

describe('useMeasure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    observerMap.clear()
  })

  it('returns initial width/height=0 if ref is null', () => {
    const ref = { current: null }
    const { result } = renderHook(() => useMeasure(ref as any))
    expect(result.current.width).toBe(0)
    expect(result.current.height).toBe(0)
  })

  it('measures element via ResizeObserver on mount', () => {
    const element = document.createElement('div')
    // Stub getBoundingClientRect to return fixed dimensions.
    Object.defineProperty(element, 'getBoundingClientRect', {
      value: () => ({ width: 100, height: 50 }),
      writable: true,
    })
    const ref = { current: element }

    const { result } = renderHook(() => useMeasure(ref))
    expect(result.current.width).toBe(100)
    expect(result.current.height).toBe(50)
  })

  it('updates when element size changes', async () => {
    const element = document.createElement('div')
    let rect = { width: 100, height: 50 }
    element.getBoundingClientRect = vi.fn(() => rect)

    const ref = { current: element }
    const { result } = renderHook(() => useMeasure(ref))

    // Update the rect values.
    rect = { width: 150, height: 75 }

    // Trigger the observer callback and wait for RAF.
    await act(async () => {
      const callback = observerMap.get(element)
      callback?.([], {} as ResizeObserver)
      await new Promise(resolve => requestAnimationFrame(resolve))
    })

    expect(result.current.width).toBe(150)
    expect(result.current.height).toBe(75)
  })

  it('avoids state update if size is unchanged', () => {
    let renderCount = 0
    const element = document.createElement('div')
    // Start with 0x0 dimensions.
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 0, height: 0 })

    const ref = { current: element }
    const { rerender } = renderHook(() => {
      renderCount++
      return useMeasure(ref)
    })
    expect(renderCount).toBe(1)

    // Trigger observer event with same dimensions.
    act(() => {
      observerMap.get(element)?.([], {} as ResizeObserver)
    })

    expect(renderCount).toBe(1)
  })

  it('refresh() triggers a manual re-measure', () => {
    const element = document.createElement('div')
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 100, height: 50 })

    const ref = { current: element }
    const { result } = renderHook(() => useMeasure(ref))

    expect(result.current.width).toBe(100)
    expect(result.current.height).toBe(50)

    // Change the dimensions.
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 200, height: 100 })

    // Trigger manual refresh.
    act(() => {
      result.current.refresh()
    })

    expect(result.current.width).toBe(200)
    expect(result.current.height).toBe(100)
  })
})

describe('useMeasure - Error Handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })


  it('handles getBoundingClientRect throwing an error by setting dimensions to 0', async () => {
    const element = document.createElement('div')
    let shouldThrow = false
    element.getBoundingClientRect = vi.fn(() => {
      if (shouldThrow) throw new Error('Rect error!')
      return { width: 100, height: 50 }
    })

    const ref = { current: element }
    const { result } = renderHook(() => useMeasure(ref))

    // Initially, measurement should succeed.
    expect(result.current.width).toBe(100)
    expect(result.current.height).toBe(50)

    // Now force getBoundingClientRect to throw by forcing a manual refresh.
    shouldThrow = true

    await act(async () => {
      result.current.refresh()
      // Wait for one RAF cycle.
      await new Promise((r) => requestAnimationFrame(r))
    })

    // After error, dimensions should be reset to 0.
    expect(result.current.width).toBe(0)
    expect(result.current.height).toBe(0)
  })
})