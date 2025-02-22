import { renderHook, act } from '@testing-library/react'
import { useMeasure } from '@/hooks/useMeasure'

class ResizeObserverMock {
  callback: ResizeObserverCallback
  elements: Element[] = []

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.elements.push(target)
    // Trigger immediate callback
    this.trigger()
  }

  unobserve() {
  }

  disconnect() {
  }

  trigger() {
    this.callback([{
      target: this.elements[0],
      contentRect: { width: 100, height: 50 },
    } as ResizeObserverEntry], this)
  }
}

describe('useMeasure', () => {
  const originalRAF = window.requestAnimationFrame

  // In useMeasure.test.ts
  beforeAll(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    window.ResizeObserver = ResizeObserverMock
    window.requestAnimationFrame = (cb) => {
      cb() // Execute immediately
      return 0
    }
  })

  it('measures element via ResizeObserver on mount', () => {
    const element = document.createElement('div')
    // Patch getBoundingClientRect to return fixed dimensions.
    element.getBoundingClientRect = () => ({
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      bottom: 50,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {
      },
    })
    const ref = { current: element }
    const { result } = renderHook(() => useMeasure(ref))

    // Because the hook now calls measure() synchronously within useLayoutEffect,
    // no async waiting is required.
    expect(result.current.width).toBe(100)
    expect(result.current.height).toBe(50)
  })

  it('refresh() triggers manual measurement', async () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useMeasure(ref))

    await vi.runAllTimersAsync()

    // Mock new measurement
    vi.spyOn(ref.current, 'getBoundingClientRect').mockReturnValue({
      width: 200,
      height: 100,
    } as DOMRect)

    act(() => result.current.refresh())
    await vi.runAllTimersAsync()

    expect(result.current.width).toBe(200)
    expect(result.current.height).toBe(100)
  })

  it('handles errors in getBoundingClientRect', async () => {
    const ref = {
      current: {
        getBoundingClientRect: () => {
          throw new Error('Test error')
        },
      },
    }

    const { result } = renderHook(() => useMeasure(ref))

    // Advance timers to resolve async operations
    await vi.advanceTimersByTimeAsync(1)

    expect(result.current.width).toBe(0)
    expect(result.current.height).toBe(0)
  })
})
