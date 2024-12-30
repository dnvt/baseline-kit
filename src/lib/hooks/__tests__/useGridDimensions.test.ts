import { renderHook, act } from '@testing-library/react'
import { useGridDimensions } from '@hooks'

// Mock ResizeObserver
const observerMap = new Map()
const mockResizeObserver = vi.fn((callback: unknown) => ({
  observe: vi.fn((element: unknown) => {
    observerMap.set(element, callback)
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('useGridDimensions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    observerMap.clear()
  })

  it('updates dimensions when element resizes', () => {
    // Create element with mocked getBoundingClientRect
    const element = document.createElement('div')
    element.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 100,
      height: 200,
    })

    const ref = { current: element }
    const { result } = renderHook(() => useGridDimensions(ref))

    // Trigger initial measurement
    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([{ target: ref.current }])
    })

    expect(result.current).toEqual({ width: 100, height: 200 })

    // Test resize
    element.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 150,
      height: 300,
    })

    act(() => {
      const callback = observerMap.get(ref.current)
      callback?.([{ target: ref.current }])
    })

    expect(result.current).toEqual({ width: 150, height: 300 })
  })

  it('handles null ref', () => {
    const ref = { current: null }
    const { result } = renderHook(() => useGridDimensions(ref))

    expect(result.current).toEqual({ width: 0, height: 0 })
  })
})
