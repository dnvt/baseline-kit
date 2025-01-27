import { act, renderHook } from '@testing-library/react'
import { usePaddingSnap } from '@hooks'
import { testUtils } from '../setup'

// Mock ResizeObserver
const observerMap = new Map<HTMLElement, ResizeObserverCallback>()
const mockResizeObserver = vi.fn().mockImplementation((callback: ResizeObserverCallback) => ({
  observe: vi.fn((element: HTMLElement) => {
    observerMap.set(element, callback)
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('usePaddingSnap', () => {
  beforeEach(() => {
    vi.useFakeTimers() // Use fake timers to control effects
    vi.clearAllMocks()
    observerMap.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('Height Mode', () => {
    it('keeps original padding when total height is multiple of base', async () => {
      const element = document.createElement('div')
      const ref = { current: element }

      // Mock offsetHeight to return a height that's multiple of base
      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: 48, // multiple of 8
      })

      const { result } = renderHook(() =>
        usePaddingSnap(10, 'height', 8, ref),
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      expect(result.current).toBe(10)
    })

    it('adjusts bottom padding to make total height multiple of base', async () => {
      const element = document.createElement('div')
      const ref = { current: element }

      // Mock offsetHeight to return a height that needs adjustment
      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: 46, // needs +2 to reach 48
      })

      const { result, rerender } = renderHook(() =>
        usePaddingSnap(10, 'height', 8, ref),
      )

      // Force effects to run
      await act(async () => {
        rerender()
        await vi.runAllTimersAsync()
      })

      expect(result.current).toBe(12) // 10 + 2 = 12
    })

    it('handles larger height adjustments', async () => {
      const element = document.createElement('div')
      const ref = { current: element }

      // Mock offsetHeight to return a height that needs larger adjustment
      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: 42, // needs +6 to reach 48
      })

      const { result, rerender } = renderHook(() =>
        usePaddingSnap(10, 'height', 8, ref),
      )

      // Force effects to run
      await act(async () => {
        rerender()
        await vi.runAllTimersAsync()
      })

      expect(result.current).toBe(16) // 10 + 6 = 16
    })
  })

  describe('Clamp Mode', () => {
    it('clamps padding to base remainder and adjusts for height', async () => {
      const element = document.createElement('div')
      const ref = { current: element }

      // Mock offsetHeight to return a height that needs adjustment
      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: 46, // needs +2 to reach 48
      })

      const { result, rerender } = renderHook(() =>
        usePaddingSnap(10, 'clamp', 8, ref),
      )

      // Force effects to run
      await act(async () => {
        rerender()
        await vi.runAllTimersAsync()
      })

      // 12 % 8 = 4 (initial clamp)
      expect(result.current).toBe(4)
    })

    it('prevents zero padding by using base value', async () => {
      const element = document.createElement('div')
      const ref = { current: element }

      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: 40,
      })

      const { result, rerender } = renderHook(() =>
        usePaddingSnap(8, 'clamp', 8, ref),
      )

      await act(async () => {
        rerender()
        await vi.runAllTimersAsync()
      })

      expect(result.current).toBe(8)
    })

    it('handles multiple adjustments correctly', async () => {
      const element = document.createElement('div')
      const ref = { current: element }

      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: 46,
      })

      const { result, rerender } = renderHook(() =>
        usePaddingSnap(6, 'clamp', 8, ref),
      )

      await act(async () => {
        rerender()
        await vi.runAllTimersAsync()
      })

      expect(result.current).toBe(8)
    })

    it('reclamps padding after height adjustment if it exceeds base', async () => {
      const element = document.createElement('div')
      const ref = { current: element }

      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: 44, // needs +4 to reach 48
      })

      const { result, rerender } = renderHook(() =>
        usePaddingSnap(6, 'clamp', 8, ref),
      )

      await act(async () => {
        rerender()
        await vi.runAllTimersAsync()
      })

      // Initial: 6 (6 % 8 = 6)
      // Height needs +4
      // 6 + 4 = 10
      // Final reclamp: 10 % 8 = 2
      expect(result.current).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles null ref', () => {
      const ref = { current: null }

      const { result } = renderHook(() =>
        usePaddingSnap(10, 'height', 8, ref),
      )

      // Should return original padding if ref is null
      expect(result.current).toBe(10)
    })

    it('throws error if base is less than 1', () => {
      const element = document.createElement('div')
      const ref = { current: element }

      testUtils.mockElementSize(element, 100, 40)

      expect(() => {
        renderHook(() => usePaddingSnap(10, 'clamp', 0, ref))
      }).toThrow('Base must be greater than or equal to 1')

      expect(() => {
        renderHook(() => usePaddingSnap(10, 'clamp', -1, ref))
      }).toThrow('Base must be greater than or equal to 1')
    })

  })
})
