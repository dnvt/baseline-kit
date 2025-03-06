/**
 * Creates a debounced version of a function.
 *
 * @remarks
 * Useful for:
 * - Handling rapid event sequences
 * - Limiting API calls
 * - Performance optimization
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```ts
 * const handleResize = debounce(() => {
 *   // Expensive calculation
 * }, 100);
 *
 * window.addEventListener('resize', handleResize);
 * ```
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): [T, () => void] => {
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const debounced = ((...args) => {
    cancel()
    timer = setTimeout(() => fn(...args), delay)
  }) as T

  return [debounced, cancel]
}

/**
 * Creates a requestAnimationFrame-based throttled function.
 *
 * @remarks
 * Optimizes performance by:
 * - Limiting execution to animation frames
 * - Preventing rapid-fire calls
 * - Maintaining visual smoothness
 *
 * @param fn - Function to throttle
 * @returns RAF-throttled function
 *
 * @example
 * ```ts
 * const updateScroll = rafThrottle(() => {
 *   // Update scroll position
 * });
 *
 * document.addEventListener('scroll', updateScroll);
 * ```
 */
export const rafThrottle = <T extends (...args: never[]) => void>(
  fn: T,
): T => {
  let rafId: number | null = null
  let lastArgs: Parameters<T> | null = null

  const throttled = (...args: Parameters<T>) => {
    lastArgs = args

    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      fn(...lastArgs!)
      rafId = null
      lastArgs = null
    })
  }

  return throttled as T
}
