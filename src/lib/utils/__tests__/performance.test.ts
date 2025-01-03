import { debounce, rafThrottle, clamp, round } from '@utils'

describe('Performance Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debounce', () => {
    it('executes function only once after delay', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn(1)
      debouncedFn(2)
      debouncedFn(3)

      expect(fn).not.toBeCalled()

      vi.runAllTimers()

      expect(fn).toBeCalledTimes(1)
      expect(fn).toBeCalledWith(3)
    })

    it('cancels previous timeout on new calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      vi.advanceTimersByTime(50) // Half way through the timeout

      debouncedFn() // Should reset the timeout
      vi.advanceTimersByTime(50) // Original timeout would have fired here

      expect(fn).not.toBeCalled()

      vi.advanceTimersByTime(50) // Complete the new timeout
      expect(fn).toBeCalledTimes(1)
    })
  })

  describe('rafThrottle', () => {
    it('throttles function calls using requestAnimationFrame', () => {
      const fn = vi.fn()
      const throttledFn = rafThrottle(fn)
      const raf = vi.spyOn(window, 'requestAnimationFrame')

      throttledFn()
      throttledFn()
      throttledFn()

      expect(raf).toBeCalledTimes(1)
      expect(fn).not.toBeCalled()

      // Trigger rAF callback
      raf.mock.calls[0][0](performance.now())

      expect(fn).toBeCalledTimes(1)
    })

    it('allows new call after frame completes', () => {
      const fn = vi.fn()
      const throttledFn = rafThrottle(fn)
      const raf = vi.spyOn(window, 'requestAnimationFrame')

      throttledFn()
      raf.mock.calls[0][0](performance.now()) // Complete first frame

      throttledFn() // Should schedule new frame
      expect(raf).toBeCalledTimes(2)
    })
  })

  describe('clamp', () => {
    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('clamps to minimum', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('clamps to maximum', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('handles equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10)
    })

    it('handles floating point numbers', () => {
      expect(clamp(1.5, 1, 2)).toBe(1.5)
      expect(clamp(0.5, 1, 2)).toBe(1)
      expect(clamp(2.5, 1, 2)).toBe(2)
    })
  })

  describe('round', () => {
    it('rounds to integer by default', () => {
      expect(round(1.234)).toBe(1)
      expect(round(1.567)).toBe(2)
    })

    it('rounds to specified decimal places', () => {
      expect(round(1.234, 2)).toBe(1.23)
      expect(round(1.235, 2)).toBe(1.24)
    })

    it('handles negative numbers', () => {
      expect(round(-1.234, 2)).toBe(-1.23)
      expect(round(-1.235, 2)).toBe(-1.24)
    })

    it('handles zero precision', () => {
      expect(round(1.234, 0)).toBe(1)
    })

    it('handles negative precision', () => {
      expect(round(123.456, -1)).toBe(120)
      expect(round(123.456, -2)).toBe(100)
    })
  })
})
