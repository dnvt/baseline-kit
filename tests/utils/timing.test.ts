import { debounce, rafThrottle } from '@utils'

describe('Timing Utils', () => {
  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('delays execution until the specified delay has passed', () => {
      const fn = vi.fn()
      const [debounced] = debounce(fn, 100)

      debounced()
      vi.advanceTimersByTime(99)
      expect(fn).not.toBeCalled()

      vi.advanceTimersByTime(1)
      expect(fn).toBeCalledTimes(1)
    })

    it('only calls the function once if invoked repeatedly within the delay', () => {
      const fn = vi.fn()
      const [debounced] = debounce(fn, 100)

      debounced(1)
      vi.advanceTimersByTime(50)
      debounced(2)
      vi.advanceTimersByTime(50)
      debounced(3)
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(3)
    })

    it('allows manual cancellation of pending executions', () => {
      const fn = vi.fn()
      const [debounced, cancel] = debounce(fn, 100)

      debounced()
      vi.advanceTimersByTime(50)
      cancel()
      vi.advanceTimersByTime(100)

      expect(fn).not.toHaveBeenCalled()
    })

    it('prevents execution after unmount cleanup', () => {
      const fn = vi.fn()
      const [debounced, cancel] = debounce(fn, 100)

      debounced()
      cancel() // Simulate useEffect cleanup
      vi.advanceTimersByTime(100)

      expect(fn).not.toHaveBeenCalled()
    })

    it('maintains latest arguments when called multiple times', () => {
      const fn = vi.fn()
      const [debounced] = debounce(fn, 100)

      debounced('first')
      vi.advanceTimersByTime(50)
      debounced('second')
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('second')
    })
  })

  describe('rafThrottle', () => {
    // Use real timers here so that requestAnimationFrame behaves normally.
    beforeEach(() => {
      vi.useRealTimers()
    })

    it('throttles the function to execute once per animation frame', async () => {
      const fn = vi.fn()
      const throttled = rafThrottle(fn)

      throttled('first')
      throttled('second')

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('second') // Updated expectation
    })

    it('allows subsequent calls after an animation frame has passed', async () => {
      const fn = vi.fn()
      const throttled = rafThrottle(fn)

      throttled(1)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      expect(fn).toHaveBeenCalledTimes(1)

      throttled(2)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith(2)
    })
  })
})