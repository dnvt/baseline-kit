/**
 * @file timing.ts
 * @description Performance optimization utilities
 * @module utils
 */

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
): T => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
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
export const rafThrottle = <T extends (...args: unknown[]) => void>(
  fn: T,
): T => {
  let rafId: number | null = null
  return ((...args) => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      fn(...args)
      rafId = null
    })
  }) as T
}