import { debounce, rafThrottle } from '@utils'

describe('Timing Utils', () => {
  beforeEach(() => vi.useFakeTimers())

  describe('debounce', () => {
    it('delays execution', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      vi.advanceTimersByTime(99)
      expect(fn).not.toBeCalled()

      vi.advanceTimersByTime(1)
      expect(fn).toBeCalled()
    })
  })

  describe('rafThrottle', () => {
    it('throttles using animation frames', () => {
      const fn = vi.fn()
      const throttled = rafThrottle(fn)

      throttled()
      throttled()
      requestAnimationFrame(() => {
        expect(fn).toBeCalledTimes(1)
      })
    })
  })
})
