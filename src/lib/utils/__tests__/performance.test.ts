import { debounce, rafThrottle, clamp, round } from '@utils'

describe('Performance Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('debounce', () => {
    it('debounces function calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(fn).not.toBeCalled()

      vi.runAllTimers()

      expect(fn).toBeCalledTimes(1)
    })
  })

  describe('rafThrottle', () => {
    it('throttles function calls using requestAnimationFrame', () => {
      const fn = vi.fn()
      const throttledFn = rafThrottle(fn)

      // Mock requestAnimationFrame
      const raf = vi.spyOn(window, 'requestAnimationFrame')

      throttledFn()
      throttledFn()
      throttledFn()

      expect(raf).toBeCalledTimes(1)
      expect(fn).not.toBeCalled()

      // Trigger rAF callback
      raf.mock.calls[0][0]()

      expect(fn).toBeCalledTimes(1)
    })
  })

  describe('clamp', () => {
    it('clamps values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('round', () => {
    it('rounds numbers to specified precision', () => {
      expect(round(1.234)).toBe(1)
      expect(round(1.234, 2)).toBe(1.23)
      expect(round(1.235, 2)).toBe(1.24)
    })
  })
})