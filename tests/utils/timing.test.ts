import { debounce, rafThrottle } from '@utils'

describe('Timing Utils', () => {
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
})
