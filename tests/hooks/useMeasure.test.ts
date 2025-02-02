import { renderHook, act } from '@testing-library/react'
import { useMeasure } from '@hooks'

// Mock ResizeObserver if it's not natively available in your test env
const observerMap = new Map<HTMLElement, ResizeObserverCallback>()
const mockResizeObserver = vi
  .fn()
  .mockImplementation((callback: ResizeObserverCallback) => ({
    observe: (el: HTMLElement) => observerMap.set(el, callback),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

vi.stubGlobal('ResizeObserver', mockResizeObserver)
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

describe('useMeasurement', () => {
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

    // Update rect and trigger observer
    rect = { width: 150, height: 75 }

    await act(async () => {
      const callback = observerMap.get(element)
      callback?.([], {} as ResizeObserver)
      // Wait for RAF
      await new Promise(resolve => requestAnimationFrame(resolve))
    })

    expect(result.current.width).toBe(150)
    expect(result.current.height).toBe(75)
  })

  it('avoids state update if size is unchanged', () => {
    let renderCount = 0
    const element = document.createElement('div')

    // Start with 0x0 so the hook won't update after mount
    element.getBoundingClientRect = vi.fn().mockReturnValue({ width: 0, height: 0 })

    const ref = { current: element }

    // Mount => 1 render
    const { rerender } = renderHook(() => {
      renderCount++
      return useMeasure(ref)
    })
    expect(renderCount).toBe(1) // still at 0x0

    // Now "observer" event with the same size: 0x0 => no change => no new render
    act(() => {
      observerMap.get(element)?.([], {} as ResizeObserver)
    })

    expect(renderCount).toBe(1)
  })

  it('refresh() triggers a manual re-measure', () => {
    const element = document.createElement('div')
    element.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ width: 100, height: 50 })

    const ref = { current: element }
    const { result } = renderHook(() => useMeasure(ref))

    expect(result.current.width).toBe(100)
    expect(result.current.height).toBe(50)

    element.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ width: 200, height: 100 })

    // Manual refresh
    act(() => {
      result.current.refresh()
    })

    expect(result.current.width).toBe(200)
    expect(result.current.height).toBe(100)
  })
})

describe('Error Handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('handles getBoundingClientRect throwing an error', async () => {
    const element = document.createElement('div')
    let shouldThrow = false
    element.getBoundingClientRect = vi.fn(() => {
      if (shouldThrow) throw new Error('Rect error!')
      return { width: 100, height: 50 }
    })

    const ref = { current: element }
    renderHook(() => useMeasure(ref)) // no need to store result if we only check final outcome

    shouldThrow = true

    await act(async () => {
      const callback = observerMap.get(element)
      callback?.([], {} as ResizeObserver)
      // flush one RAF
      await new Promise((r) => requestAnimationFrame(r))
    })

    // Now check that it set [0, 0] or some fallback
    // If your code sets (0,0) after error:
    // you'd re-render once => let's verify final state
  })
})
