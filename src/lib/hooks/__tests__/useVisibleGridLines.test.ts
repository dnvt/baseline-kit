import { renderHook, act } from '@testing-library/react'
import { useVisibleGridLines } from '@hooks'

// Mock IntersectionObserver
const observerMap = new Map()
const mockIntersectionObserver = vi.fn((callback: unknown) => ({
  observe: vi.fn((element: unknown) => {
    observerMap.set(element, callback)
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

describe('useVisibleGridLines', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    observerMap.clear()

    // Set fixed window height
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    })
  })

  it('calculates buffer zones correctly', () => {
    const ref = { current: document.createElement('div') }
    const buffer = 160 // Default buffer
    const lineHeight = 8

    const { result } = renderHook(() =>
      useVisibleGridLines({
        totalLines: 100,
        lineHeight,
        containerRef: ref,
      }),
    )

    // Trigger intersection observer
    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([
        {
          isIntersecting: true,
          boundingClientRect: { top: 0, bottom: 800 },
          target: ref.current,
        },
      ])
    })

    const bufferLines = Math.ceil(buffer / lineHeight)
    const viewportLines = Math.ceil(800 / lineHeight)

    expect(result.current.end).toBe(Math.min(100, viewportLines + bufferLines))
  })

  it('respects total lines limit', () => {
    const ref = { current: document.createElement('div') }
    const totalLines = 50

    const { result } = renderHook(() =>
      useVisibleGridLines({
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
          boundingClientRect: { top: 0, bottom: 800 },
          target: ref.current,
        },
      ])
    })

    expect(result.current.end).toBeLessThanOrEqual(totalLines)
  })

  it('handles custom buffer size', () => {
    const ref = { current: document.createElement('div') }
    const customBuffer = 80 // Half of default buffer

    const { result } = renderHook(() =>
      useVisibleGridLines({
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
          boundingClientRect: { top: 0, bottom: 800 },
          target: ref.current,
        },
      ])
    })

    const maxVisibleLines = Math.ceil((800 + customBuffer * 2) / 8)
    expect(result.current.end).toBeLessThanOrEqual(maxVisibleLines)
  })
})
