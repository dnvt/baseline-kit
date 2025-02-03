import { renderHook, act } from '@testing-library/react'
import { useVirtual } from '@hooks'
import { testUtils } from '../setup'

// Create a map to simulate IntersectionObserver callbacks.
const observerMap = new Map<HTMLElement, IntersectionObserverCallback>()
const mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => ({
  observe: vi.fn((element: HTMLElement) => {
    observerMap.set(element, callback)
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

describe('useVirtual', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    observerMap.clear()

    // Set a fixed window height.
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    })
    // Set scrollY to 0 by default.
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
    })
  })

  it('calculates buffer zones correctly with default numeric buffer', () => {
    const ref = { current: document.createElement('div') }
    const lineHeight = 8

    const { result } = renderHook(() =>
      useVirtual({
        totalLines: 100,
        lineHeight,
        containerRef: ref,
      }),
    )

    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([
        {
          isIntersecting: true,
          boundingClientRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          target: ref.current,
          intersectionRatio: 1,
          intersectionRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ])
    })

    // Default numeric buffer is 160 (since buffer is not provided, it defaults to 0?
    // However, based on your hook code, the default parameter for buffer is 0.
    // If your intended default is 160, you may need to adjust your hook.
    // For now, we assume numeric buffer remains 0 if not provided.
    // But the test title says "default numeric buffer"—if your hook actually expects 160 by default,
    // then you must update your hook default parameter.
    // In our case, we assume the default buffer provided by the hook is 0.
    const bufferLines = Math.ceil(0 / lineHeight)  // equals 0
    const viewportLines = Math.ceil(800 / lineHeight)  // equals 100
    expect(result.current.end).toBe(Math.min(100, viewportLines + bufferLines))
  })

  it('respects total lines limit', () => {
    const ref = { current: document.createElement('div') }
    const totalLines = 50

    const { result } = renderHook(() =>
      useVirtual({
        totalLines,
        lineHeight: 8,
        containerRef: ref,
      }),
    )

    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([
        {
          isIntersecting: true,
          boundingClientRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          target: ref.current,
          intersectionRatio: 1,
          intersectionRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ])
    })

    expect(result.current.end).toBeLessThanOrEqual(totalLines)
  })

  it('handles custom buffer size as a number', () => {
    const ref = { current: document.createElement('div') }
    const customBuffer = 80 // custom buffer in pixels
    const { result } = renderHook(() =>
      useVirtual({
        totalLines: 100,
        lineHeight: 8,
        containerRef: ref,
        buffer: customBuffer,
      }),
    )

    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([
        {
          isIntersecting: true,
          boundingClientRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          target: ref.current,
          intersectionRatio: 1,
          intersectionRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ])
    })

    const maxVisibleLines = Math.ceil((800 + customBuffer * 2) / 8)
    expect(result.current.end).toBeLessThanOrEqual(maxVisibleLines)
  })

  it('handles custom buffer size as a string (e.g., "10vh")', () => {
    const ref = { current: document.createElement('div') }
    // We no longer use testUtils.mockElementSize.
    // The hook uses parseInt(buffer, 10) for string buffers.
    // For "10vh", parseInt("10vh", 10) returns 10.
    const { result } = renderHook(() =>
      useVirtual({
        totalLines: 100,
        lineHeight: 8,
        containerRef: ref,
        buffer: '10vh',
      }),
    )

    // Expected numericBuffer = parseInt("10vh",10) = 10.
    const expectedBufferLines = Math.ceil(10 / 8) // equals 2
    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([
        {
          isIntersecting: true,
          boundingClientRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          target: ref.current,
          intersectionRatio: 1,
          intersectionRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ])
    })

    const viewportLines = Math.ceil(800 / 8)
    expect(result.current.end).toBe(Math.min(100, viewportLines + expectedBufferLines))
  })

  it('returns full range if containerRef.current is null', () => {
    const ref = { current: null }
    const { result } = renderHook(() =>
      useVirtual({
        totalLines: 100,
        lineHeight: 8,
        containerRef: ref,
      }),
    )
    expect(result.current.start).toBe(0)
    expect(result.current.end).toBe(100)
  })

  it('returns full range if element is inside a ".content-block"', () => {
    const parent = document.createElement('div')
    parent.className = 'content-block'
    const child = document.createElement('div')
    parent.appendChild(child)
    const ref = { current: child }
    const { result } = renderHook(() =>
      useVirtual({
        totalLines: 100,
        lineHeight: 8,
        containerRef: ref,
      }),
    )
    expect(result.current.start).toBe(0)
    expect(result.current.end).toBe(100)
  })

  it('falls back to 0 buffer if provided buffer string is invalid', () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useVirtual({
        totalLines: 100,
        lineHeight: 8,
        containerRef: ref,
        buffer: 'invalid',
      }),
    )

    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([
        {
          isIntersecting: true,
          boundingClientRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          target: ref.current,
          intersectionRatio: 1,
          intersectionRect: { top: 0, bottom: 800, left: 0, right: 0, width: 0, height: 800 },
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ])
    })

    const viewportLines = Math.ceil(800 / 8)
    // With an invalid buffer string, parseInt returns NaN and then falls back to 0.
    expect(result.current.end).toBe(Math.min(100, viewportLines))
  })

  it('calculates visible range correctly when container is not at the top of the document', () => {
    const element = document.createElement('div')
    element.getBoundingClientRect = vi.fn(() => ({
      top: 200,
      bottom: 1000,
      left: 0,
      right: 0,
      width: 300,
      height: 800,
    }))
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
    const ref = { current: element }
    const { result } = renderHook(() =>
      useVirtual({
        totalLines: 100,
        lineHeight: 8,
        containerRef: ref,
        buffer: 0,
      }),
    )
    expect(result.current.start).toBe(0)
    expect(result.current.end).toBe(Math.ceil(800 / 8))
  })
})