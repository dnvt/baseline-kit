import { renderHook, act } from '@testing-library/react'
import { useVirtual } from '@hooks'
import { cssTestUtils } from '../matchers/cssTestUtils'
import { testUtils } from '../setup'

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
      useVirtual({
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
          boundingClientRect: { top: 0, bottom: 800 },
          target: ref.current,
        },
      ])
    })

    const maxVisibleLines = Math.ceil((800 + customBuffer * 2) / 8)
    expect(result.current.end).toBeLessThanOrEqual(maxVisibleLines)
  })

  describe('Buffer Unit Handling', () => {
    beforeEach(() => {
      cssTestUtils.createTestContext({
        viewportHeight: 800,
        viewportWidth: 1024,
      })
    })

    it('handles viewport-relative buffer', () => {
      const ref = { current: document.createElement('div') }
      testUtils.mockElementSize(ref.current, 1024, 800)

      const { result } = renderHook(() =>
        useVirtual({
          totalLines: 100,
          lineHeight: 8,
          containerRef: ref,
          buffer: '10vh',
        }),
      )

      const bufferInPixels = cssTestUtils.convertToPx('10vh')
      const expectedBufferLines = Math.ceil(bufferInPixels / 8)

      act(() => {
        const callback = observerMap.get(ref.current)
        callback?.([{
          isIntersecting: true,
          boundingClientRect: { top: 0, bottom: 800 },
          target: ref.current,
        }])
      })

      const viewportLines = Math.ceil(800 / 8)
      expect(result.current.end).toBe(
        Math.min(100, viewportLines + expectedBufferLines),
      )
    })
  })

})


