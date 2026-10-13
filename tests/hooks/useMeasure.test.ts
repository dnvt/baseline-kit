import * as React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useMeasure } from '@baseline-kit/react/hooks/useMeasure'

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

  unobserve() {}

  disconnect() {}

  trigger() {
    this.callback(
      [
        {
          target: this.elements[0],
          contentRect: { width: 100, height: 50 },
        } as ResizeObserverEntry,
      ],
      this
    )
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
      toJSON: () => {},
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

  it('measures the new element when the ref points at another one', () => {
    const sized = (height: number) => {
      const element = document.createElement('div')
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        width: 100,
        height,
      } as DOMRect)
      return element
    }
    const ref = { current: sized(50) }
    const { result, rerender } = renderHook(() => useMeasure(ref))
    expect(result.current.height).toBe(50)

    // A Box whose `as` changes renders a new host element.
    ref.current = sized(70)
    rerender()
    expect(result.current.height).toBe(70)
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

describe('useMeasure observer lifecycle', () => {
  // Tracks live observers and the element each one watches.
  const live = new Map<object, { element: Element; fire: () => void }>()
  class TrackingObserver {
    constructor(private callback: ResizeObserverCallback) {}
    observe(element: Element) {
      live.set(this, {
        element,
        fire: () => this.callback([], this as unknown as ResizeObserver),
      })
    }
    unobserve() {}
    disconnect() {
      live.delete(this)
    }
  }
  const sized = (height: () => number) => {
    const element = document.createElement('div')
    element.getBoundingClientRect = () =>
      ({ width: 100, height: height() }) as DOMRect
    return element
  }
  const original = window.ResizeObserver

  beforeEach(() => {
    live.clear()
    window.ResizeObserver = TrackingObserver as unknown as typeof ResizeObserver
  })
  afterEach(() => {
    window.ResizeObserver = original
  })

  it('observes again after a StrictMode remount and stops on unmount', () => {
    let height = 50
    const element = sized(() => height)
    const ref = { current: element }
    const { result, unmount } = renderHook(() => useMeasure(ref), {
      wrapper: React.StrictMode,
    })
    expect(result.current.height).toBe(50)
    expect(live.size).toBe(1)

    height = 70
    act(() => {
      for (const entry of [...live.values()]) entry.fire()
    })
    expect(result.current.height).toBe(70)

    unmount()
    expect(live.size).toBe(0)
  })

  it('follows the ref from one element to none and back', () => {
    const first = sized(() => 50)
    const second = sized(() => 70)
    const ref: { current: HTMLElement | null } = { current: first }
    const { result, rerender, unmount } = renderHook(() => useMeasure(ref))

    ref.current = second
    rerender()
    expect(result.current.height).toBe(70)
    expect([...live.values()].map((entry) => entry.element)).toEqual([second])

    ref.current = null
    rerender()
    expect(live.size).toBe(0)

    ref.current = first
    rerender()
    expect(result.current.height).toBe(50)
    expect(live.size).toBe(1)

    unmount()
    expect(live.size).toBe(0)
  })
})
